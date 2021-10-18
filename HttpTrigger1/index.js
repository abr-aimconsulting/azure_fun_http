module.exports = async function (context, req) {
    // context.log(req.body);
    const URL = "https://logx.optimizely.com/v1/events";
    const { v4: uuid_v4} = require('uuid');
    const fetch = require("node-fetch");
    const fs = require('fs');

    const multiplier = 100;
    const configAPI = JSON.parse(fs.readFileSync(context.executionContext.functionDirectory + '\\configAPI.json'));
    let element = req.body;
    
    if (element.purchase_time_ !== '0000000000' && typeof(element.optimizelyEndUserID) !== 'undefined'){
        // context.log(element.purchase_time_);
        for (let file_index=0; file_index<configAPI.length; file_index++){

            // no activation
            // var activateJson = {
            //     account_id: configAPI[file_index]['account_id'],
            //     anonymize_ip: true,
            //     client_name: "ecomm/digitaldatafoundations/azureOptimizelyConnector",
            //     client_version: "1.0.0",
            //     enrich_decisions: true,
            //     project_id: configAPI[file_index]['project_id'],
            //     visitors: 
            //     [
            //         {
            //         visitor_id: element.optimizelyEndUserID,
            //         snapshots: [
            //         {
            //             decisions: [
            //                 {
            //                 campaign_id: configAPI[file_index]['campaign_or_layer_id'],
            //                 experiment_id: configAPI[file_index]['experiment_id'],
            //                 variation_id: configAPI[file_index]['original_variation']
            //                 },
            //             ],
            //             events: [
            //                         {
            //                         entity_id: configAPI[file_index]['campaign_or_layer_id'],
            //                         type: "campaign_activated",
            //                         timestamp: Date.now(),
            //                         uuid: uuid_v4(),
            //                         },
            //                     ],
            //                 },
            //             ],
            //         },
            //     ],
            // };
            
            
            try {
                // no activation
                // const response = await fetch(URL, {
                //     method: "POST",
                //     headers:{
                //         Accept: "application/json",
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify(activateJson),
                //     })
        
                // // context.log("Status :" + response.status);
                // // context.log("Body: " + JSON.stringify(response.body));
        
                // if (response.status.toString() !== "204") {
                //     context.log(configAPI[file_index]["name"] + " - Optimizely Events API Request Failed!");
                // }
                // else {
                //     context.log(configAPI[file_index]["name"] + " - Activating event data of user id: "+ element.optimizelyEndUserID);
                // // previous code for activation was here
                // }
                // store each bucket value
                let arr = [];
    
                // Flight Booking
                if (Number(element.Cabin_rev) > 0){
                    arr.push({
                        entity_id: configAPI[file_index]['events'][0]['entity_id'],
                        key: configAPI[file_index]['events'][0]['key'],
                        uuid: uuid_v4(),
                        revenue: Number(element.Cabin_rev)*multiplier,
                        quantity: Number(element.Total_seg),
                        timestamp: Date.now()
                    });
                }

                // First class
                if (Number(element.FC_rev) > 0){
                    arr.push({
                        entity_id: configAPI[file_index]['events'][1]['entity_id'],
                        key: configAPI[file_index]['events'][1]['key'],
                        uuid: uuid_v4(),
                        revenue: Number(element.FC_rev)*multiplier,
                        quantity: Number(element.FC_seg),
                        timestamp: Date.now()
                    });
                }

                // Premium class
                if (Number(element.PC_rev) > 0){
                    arr.push({
                        entity_id: configAPI[file_index]['events'][2]['entity_id'],
                        key: configAPI[file_index]['events'][2]['key'],
                        uuid: uuid_v4(),
                        revenue: Number(element.PC_rev)*multiplier,
                        quantity: Number(element.PC_seg),
                        timestamp: Date.now()
                    });
                }

                // Main class booking
                if (Number(element.MC_rev) > 0){
                    arr.push({
                        entity_id: configAPI[file_index]['events'][3]['entity_id'],
                        key: configAPI[file_index]['events'][3]['key'],
                        uuid: uuid_v4(),
                        revenue: Number(element.MC_rev)*multiplier,
                        quantity: Number(element.MC_seg),
                        timestamp: Date.now()
                    });
                }

                // Saver class booking
                if (Number(element.Saver_rev) > 0){
                    arr.push({
                        entity_id: configAPI[file_index]['events'][4]['entity_id'],
                        key: configAPI[file_index]['events'][4]['key'],
                        uuid: uuid_v4(),
                        revenue: Number(element.Saver_rev)*multiplier,
                        quantity: Number(element.Saver_seg),
                        timestamp: Date.now()
                    });
                }
                    
                for (let index=0; index<arr.length; index++){
                    try {
                        var eventJson = {
                            // general info connection which remains constant for now
                            account_id: configAPI[file_index]['account_id'],
                            anonymize_ip: true,
                            client_name: "ecomm/digitaldatafoundations/azureOptimizelyConnector",
                            client_version: "1.0.0",
                            enrich_decisions: true,
                            project_id: configAPI[file_index]['project_id'],
                
                            visitors: [
                                {
                                    visitor_id: element.optimizelyEndUserID,
                                    snapshots:[
                                        {
                                            events:
                                            [
                                                arr[index]
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
            
                        const res = await fetch(URL, {
                            method: "POST",
                            headers:{
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(eventJson),
                            });
                        
                        context.log("Current index:" + index);
                        context.log(configAPI[file_index]["name"] + " - Status :" + res.status);
                        
                        if (res.status.toString() !== "204") {
                            context.log(configAPI[file_index]["name"] + " User: "+ element.optimizelyEndUserID);
                            context.log("The following content was NOT sent to Optimizely Events API due to a Request Failed: ");
                            context.log("Body: " + JSON.stringify(eventJson));
                        }
                        // else{
                        //     //context.log(configAPI[file_index]["name"] + " User: "+ element.optimizelyEndUserID);
                        //     context.log("The following content has been sent to Optimizely Events API: ");
                        //     context.log("Body: " + JSON.stringify(eventJson));
                        //}
                    } catch(err){
                        context.log(configAPI[file_index]["name"] + " - Error inside of the for loop: "+ err);
                        context.log("Body: " + JSON.stringify(eventJson));
                        }
                    // context.log(configAPI[file_index]["name"] + " - The following User ID was processed: "+ element.optimizelyEndUserID);        
                }
                context.log(configAPI[file_index]["name"] + " - The following User ID was processed: "+ element.optimizelyEndUserID);
            } catch (e) {
                context.log(configAPI[file_index]["name"] + " - User id error: "+ element.optimizelyEndUserID);  
                context.log(configAPI[file_index]["name"] + " - Error: "+e);
            }
        }
    } // end if

    context.res = {
        // status: 200, /* Defaults to 200 */
        status: 200
        
    };
}