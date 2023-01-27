/*
    A const variable used for running promise functions for card data; 
*/
const CardPromises = {

    getLists: () => {
        return new Promise( resolve =>{
            
        })
    },

    getCardsByList: (listName) =>{

        return new Promise ( resolve =>{

            MyTrello.get_cards_by_list_name(listName, (data)=>{
                
                let response = JSON.parse(data.responseText);

                // Sort the cards by name
                response = response.sort( (a,b) =>{
                    return a["name"].localeCompare(b["name"]);
                });

                resolve(response);
            }, Logger.errorMessage)
        });
    },

    getCard: (cardID) => {

        return new Promise( resolve =>{

            MyTrello.get_single_card(cardID, (cardData)=>{

                let card = myajax.GetJSON(cardData.responseText);
                resolve(card);                
            });
        });
    },

    getTemplate: (templatePath, object) =>{

        return new Promise( (resolve) => {
            MyTemplates.getTemplate(templatePath, object, (template) =>{
                resolve(template);
            });
        });
    }
}