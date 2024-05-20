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
const playersTable = "DiscloseAI_Players";
const stocksTable = "DiscloseAI_Stocks";

const buy = async (player, companies) => {
  for(const company in companies){
    
    
    if(company in player.Item.stocks){
      player.Item.stocks[company] = player.Item.stocks[company] + companies[company];
    }
    else{
      player.Item.stocks[company] = companies[company];
    }
    
    let c = await dynamo.send(
          new GetCommand({
            TableName: stocksTable,
            Key: {
              'stockcode': company,
            },
          })
        );
        
    player.Item.profit = player.Item.profit + (companies[company] * c.Item.profit);
    
    if(!player.Item.needsToDisclose) {
      player.Item.needsToDisclose = player.Item.stocks[company] > 100;
    }
  }
}

const disclose = (player) => {
  for(const company in player.Item.stocks){
    player.Item.stocks[company] = 0;
  }
}

export const handler = async (event, context) => {
  let body = "test";
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };
       let requestJSON = JSON.parse(event.body);
      
       let player = await dynamo.send(
          new GetCommand({
            TableName: playersTable,
            Key: {
              name: requestJSON.name,
            },
          })
        );
        
        if(!player.Item.stocks){
          statusCode = 404;
          body = JSON.stringify(player);
          return {
            statusCode,
            body,
            headers,
          }
        }
        
        switch(requestJSON.op){
          case "Disclose":
            await disclose(player);
            break;
          case "Buy":
            await buy(player, requestJSON.companies);
            break;
        }
        
        body = JSON.stringify(player);
        
        await dynamo.send(
          new UpdateCommand({
            TableName: playersTable,
            Key: {
              name: requestJSON.name,
            },
            UpdateExpression: 'SET stocks = :stocks, needsToDisclose = :needsToDisclose, profit = :profit',
            ExpressionAttributeValues: {
                    ':stocks': player.Item.stocks || {},
                    ':needsToDisclose': player.Item.needsToDisclose || false,
                    ':profit': player.Item.profit || 0
            },
            ReturnValues: 'ALL_NEW'
          }));

  return {
    statusCode,
    body,
    headers,
  };
};