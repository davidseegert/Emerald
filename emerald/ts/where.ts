namespace Emerald {

    export class Select{
        data:object[];

        public constructor(json){
            this.data = json;
        }

        public where(query:string){
            var output = [];
            for(let e of this.data){
                var result = this.evaluate(e,query);
                if(result == true){
                    output.push(e);
                }
                if(result == null){
                    return null;
                }
            }
            return output;
        };


        evaluate(item,query):boolean{
            var evaluationQuery = query; 
            var result:any;
            result = query.match(/(NOT )?[a-z0-9_:]+( )*?(LIKE|<=|>=|<>|!=|=|<|>)( )*?(((')((\\')|[^'])*('))|([0-9]+))/gi);
            if (result == null) {
                console.error('Evaluation Error: Could not parse:"'+query+'".');
                return false;
            }
            for(let evl of result){
                var splitted = evl.split(/(LIKE|<=|>=|!=|<>|<|>|=)/);
                for(let i in splitted){
                    splitted[i] = splitted[i].trim();
                    if(splitted[i][0] == "'"){
                        splitted[i] = splitted[i].substring(1);
                    }
                    if(splitted[i][splitted[i].length-1] == "'"){
                        splitted[i] = splitted[i].substring(0,splitted[i].length-1);
                    }
                }


                //console.log("SPLITTED",splitted);

                var selector = splitted[0];
                var operator = splitted[1];
                var value = splitted[2];
                var returnValue = null;
                switch(operator){
                    case '=':
                        if(item[selector] == value){
                            returnValue = 'true';
                        }else{
                            returnValue = 'false';
                        }
                        break;
                    case '<>':
                    case '!=':
                        if(item[selector] != value){
                            returnValue = 'true';
                        }else{
                            returnValue = 'false';
                        }
                        break;
                    case '>':
                        if(item[selector] > value){
                            returnValue = 'true';
                        }else{
                            returnValue = 'false';
                        }
                        break;
                    case '<':
                        if(item[selector] < value){
                            returnValue = 'true';
                        }else{
                            returnValue = 'false';
                        }
                        break;
                    case '>=':
                        if(item[selector] >= value){
                            returnValue = 'true';
                        }else{
                            returnValue = 'false';
                        }
                        break;
                    case '<=':
                        if(item[selector] <= value){
                            returnValue = 'true';
                        }else{
                            returnValue = 'false';
                        }
                        break;
                    case 'LIKE':
                        var regexValue = value;
                        regexValue = regexValue.replace(/%/g,"(.)*");
                        regexValue = regexValue.replace(/_/g,"(.)");

                        regexValue = RegExp(regexValue,'gi');

                        if(item[selector].match(regexValue) != null){
                            returnValue = 'true';
                        }else{
                            returnValue = 'false';
                        }
                        break;
                    default:
                        console.error('Evaluation Error: Unknown operator "'+operator+'" in "'+query+'".');
                        return null;
                }

                //console.log("________",query,"_",evl,"_",returnValue);

                if(returnValue != null){
                    evaluationQuery = evaluationQuery.replace(evl,returnValue);

                }

                //console.log(splitted);
            }

            evaluationQuery = evaluationQuery.replace(' OR ',' || ');
            evaluationQuery = evaluationQuery.replace(' AND ',' && ');

            //console.log("Result:",query);

            //console.log("Final query:",query)
            return eval(evaluationQuery);
        }

    }
}