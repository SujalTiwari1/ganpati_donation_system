import { messagingService } from "../modules/messaging/container";

async function main() {

    const result =
        await messagingService.sendText({

            recipient: "8898827525",

            message: "Hello from Ganpati Messaging Module 🚀",

        });

    console.log(result);

}

main().catch(console.error);