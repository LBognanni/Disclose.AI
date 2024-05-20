import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "DiscloseAI_Players";

export const handler = async (event) => {
  let body = "test";
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
       var j = JSON.stringify(event, null, 2);
       let requestJSON = JSON.parse(j);
       body = {
         "name": requestJSON.name,
         "state": "waiting",
         "turnNumber": 0,
         "rank": {
           "roberto": 0,
           "loris": 0,
           "anibe": 0
         }
       }
  } catch (err) {
    statusCode = 400;
    body = JSON.stringify(err.message);
  } finally {
  }


  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
};