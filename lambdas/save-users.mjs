import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "DiscloseAI_Players";

export const handler = async (event, context) => {
  let body = "test";
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
       let requestJSON = JSON.parse(event.body);
       let isAdmin = false;

        const items = await dynamo.send(
          new ScanCommand({
            TableName: tableName
          })
        );
        
        if(items.Count == 0){
          isAdmin = true;
        }
        else {
          const me = await dynamo.send(
            new GetCommand({
              TableName: tableName,
              Key: {"name": requestJSON.name}
            })
          );
          
          if(me.Item){
            return {
              statusCode: 400,
              body: "user already exist",
              headers,
            };
          }
        
        }

        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              name: requestJSON.name,
              funds: 10000,
              stocks: {},
            },
          })
        );
        body = {"isAdmin" : isAdmin};
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