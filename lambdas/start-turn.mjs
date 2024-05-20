import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "DiscloseAI_GameState";

export const handler = async (event, context) => {
  let body = "next turn";
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
       const items = await dynamo.send(
          new ScanCommand({
            TableName: tableName
          })
        );

        if(items.Count > 0) {
          console.log("ABOUT TO UPDATE");
          console.log(items);
          
          for(let i = 1; i <= items.Count; i++){
            await dynamo.send(
              new PutCommand({
                TableName: tableName,
                Item: {
                  turn: i,
                  state: 'end-of-turn',
                },
              })
            );
          }
        }
        
        
        let nextTurn = items.Count + 1;
        
        console.log("NEXT TURN ***");
        console.log(nextTurn);
        
          await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              turn: nextTurn,
              state: 'waiting',
            },
          })
        );

  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }


  return {
    statusCode,
    body,
    headers,
  };
};