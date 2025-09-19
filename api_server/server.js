const express = require("express")
const {ECSClient, RunTaskCommand} = require("@aws-sdk/client-ecs")
require("dotenv").config()
const app = express()


app.use(express.json())

const PORT = 9000

console.log("KEY:", process.env.AWS_ACCESS_KEY_ID)
console.log("SECRET:", process.env.AWS_SECRET_ACCESS_KEY?.slice(0,4) + "...")
console.log("REGION:", process.env.AWS_REGION)



const ecsClient = new ECSClient({
    region:process.env.AWS_REGION,
})

const config ={ 
    CLUSTER:"arn:aws:ecs:ap-south-1:595263720847:cluster/react-pipeline",
    TASK:"arn:aws:ecs:ap-south-1:595263720847:task-definition/react-app-task:2"
}




app.use("/deploy", async (req, res)=>{

    const {
        giturl, 
        project_id
    } = req.body;



    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition:config.TASK,
        count:1,
        launchType:"FARGATE",
        networkConfiguration:{
             awsvpcConfiguration:{
                 assignPublicIp:"ENABLED",
                 subnets:['subnet-0d6267dc0d587fe51', 'subnet-07c225f4e2e645278', 'subnet-0641f7e6ae08f4e8b'],
                 securityGroups:["sg-00e287eee60c2450c"]
             }
        },
        overrides:{
            containerOverrides:[
            {
                name:"react-deploy",
                environment:[
                    {
                        name:'GIT_REPOSITORY_URL', value:giturl
                       
                    },{
                         name:'PROJECT_ID',value:project_id

                    }
                ]
            }
            ]
        }
        
    })

    await ecsClient.send(command)

    return res.json({
        success:true,
        message:"build queued",
    })
})


app.listen(PORT,()=>{
    console.log("app started to listen on port", 9000)
})