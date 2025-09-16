const { spawn } = require("child_process")
const path = require("path")
const fs = require("fs")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const mime = require("mime-types")

// ---- AWS client (NO HARDCODED KEYS) ----
const client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  
  // credentials automatically picked from ECS Task Role or env vars
  
})

const PROJECT_ID = process.env.PROJECT_ID

// ---- Fail-fast detection ----
function isReactProject(outDirPath) {
  const packageJsonPath = path.join(outDirPath, "package.json")
  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ package.json not found — not a Node.js project")
    return false
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }

  // Look for common React indicators
  if (deps["react"] && (deps["react-scripts"] || deps["vite"] || deps["next"])) {
    console.log("✅ React project detected")
    return true
  }

  console.error("❌ Not a React project (missing react/vite/next)")
  return false
}

// ---- Run a command with spawn ----
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

    console.log("Uploading:", filePath)
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `__outputs/${PROJECT_ID}/${file}`,
      Body: fs.createReadStream(filePath),
      ContentType: mime.lookup(filePath) || "application/octet-stream",
    })

    await client.send(command)
    console.log("✅ Uploaded:", filePath)
  }
}

// ---- Main flow ----
async function init() {
  console.log("🚀 Starting build pipeline")
  const outDirPath = path.join(__dirname, "output")

  if (!isReactProject(outDirPath)) {
    process.exit(1) // fail fast
  }

  try {
    await runCommand("npm", ["install"], outDirPath)
    await runCommand("npm", ["run", "build"], outDirPath)

    const distPath = path.join(outDirPath, "dist")
    await uploadToS3(distPath)
    console.log("🎉 Build + Upload complete")
  } catch (err) {
    console.error("❌ Pipeline failed:", err.message)
    process.exit(1)
  }
}

init()
