const { spawn } = require("child_process")
const path = require("path")
const fs = require("fs")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const mime = require("mime-types")

// ---- AWS client ----
const client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  // credentials automatically picked from ECS Task Role or env vars
})

const PROJECT_ID = process.env.PROJECT_ID
if (!PROJECT_ID) {
  console.error("PROJECT_ID is required")
  process.exit(1)
}

// ---- Detect vite project ----
function isViteReactProject(outDirPath) {
  const packageJsonPath = path.join(outDirPath, "package.json")
  if (!fs.existsSync(packageJsonPath)) return false

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  return deps["react"] && deps["vite"]
}

// ---- Run shell command ----
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, { cwd, shell: true })

    p.stdout.on("data", (data) => console.log(data.toString()))
    p.stderr.on("data", (data) => console.error(data.toString()))

    p.on("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`))
    })
  })
}

// ---- Upload files to S3 ----
async function uploadToS3(distPath) {
  const distFiles = fs.readdirSync(distPath, { recursive: true })

  for (const file of distFiles) {
    const filePath = path.join(distPath, file)
    if (fs.lstatSync(filePath).isDirectory()) continue

    const key = `${PROJECT_ID}/${file}` // 👈 no more __outputs
    console.log("Uploading:", key)

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: mime.lookup(filePath) || "application/octet-stream",
    })

    await client.send(command)
    console.log("✅ Uploaded:", key)
  }
}

// ---- Main flow ----
async function init() {
  console.log("Starting build pipeline")
  const outDirPath = path.join(__dirname, "output")

  if (!isViteReactProject(outDirPath)) {
    console.error(" Not a Vite React project")
    process.exit(1)
  }

  try {
    await runCommand("npm", ["install"], outDirPath)

    // 👇 Vite build with base = /PROJECT_ID/
    await runCommand("npm", ["run", "build", "--", `--base=/${PROJECT_ID}/`], outDirPath)

    const distPath = path.join(outDirPath, "dist")
    await uploadToS3(distPath)

    console.log(" Build + Upload complete")
    console.log(` Test URL: https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${PROJECT_ID}/index.html`)
  } catch (err) {
    console.error(" Pipeline failed:", err.message)
    process.exit(1)
  }
}

init()
