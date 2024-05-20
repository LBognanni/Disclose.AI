import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const stockTable = "DiscloseAI_Stocks";
const playersTable = "DiscloseAI_Players";

const companies = [
    "Amazon",
    "Apple",
    "Microsoft",
    "Tesla",
    "Wizards of the Coast"
    ];

const startGame = async () =>{
    
    for(const company of companies){
        await dynamo.send(
        new PutCommand({
            TableName: stockTable,
            Item: {
              stockcode: company,
              profit: randomProfit(),
            },
        }));
    };
};

const gameInProgress = async() =>{
    const players = await dynamo.send(new ScanCommand({TableName: playersTable}));

        return players.Items.some(player => player.turnNumber !== 0);
};

const endRound = async () =>{
    var stocks = await dynamo.send(new ScanCommand({TableName: stockTable}));
    
    // Update each item
        const promises = stocks.Items.map(async (stock) => {
            const command = new UpdateCommand({
                TableName: stockTable,
                Key: {
                    'stockcode': stock.stockCode
                },
                UpdateExpression: 'SET profit = :value',
                ExpressionAttributeValues: {
                    ':value': randomProfit()
                },
                ReturnValues: 'ALL_NEW'
            });
            
            
            return dynamo.send(command).promise();
        });

        // Execute all update operations concurrently
        await Promise.all(promises);
};

const randomProfit = () => {
        return Math.random() * (5 - -5) + -5;
    };

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
export const handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
     let body = "test";
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };

    if(await gameInProgress()){
        await endRound()
    } 
    else{
        await startGame();
    }
    
    return {
        statusCode,
        body,
        headers
    };
};
