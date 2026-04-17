namespace Emerald {
    var selector = "emerald"
    var elements:any;
    var basepath:any;
    var backup:any;
    export var data = {};


    window.onpopstate = function() {
        document.body.innerHTML = backup;
        init(basepath);
    }

    function getElements(selector:string,source){
        var elements;
        if(selector[0] == '.'){
            elements = source.getElementsByClassName(selector.substring(1));
        }
        else if(selector[0] == '#'){
            elements = source.getElementById(selector.substring(1));            
        }
        else{
            elements = source.getElementsByTagName(selector);
        }
        return elements;
    }


    function fetchJSONFile(path, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', path, false);
        httpRequest.send(); 
        if (httpRequest.status === 200) {
            var data = JSON.parse(httpRequest.responseText);
            if (callback) callback(data);
        }
    }

    function renderTemplate(template, data) {
        if (!template) return template;
        return template.replace(/{{([a-zA-Z0-9-_:]+?)}}/g, function(match, key) {
            return (data && data[key] !== undefined) ? data[key] : match;
        });
    }

    /** Returns the nth element of the url */
    function getUrlParam(index){
        var negative = false;
        var url = window.location.pathname+window.location.search+window.location.hash;
        var params = url.split('/');

        if(params[0] == ''){
            params.shift();
        }
        if(params[params.length-1] == ''){
            params.pop();
        }
        ////console.log(params);

        if(index < 0){
            return params[params.length+index];
        }
        return params[index];
    }

    function setRouteRendering(){
        for(let element of elements){
            if(element.hasAttribute('route')){
                ////console.log("route-attr",element.getAttribute('route'));
                ////console.log("result: ",routeMatch(element.getAttribute('route')));
                if(routeMatch(element.getAttribute('route')) == true){
                    //console.log("RouteMatch",element);
                    renderElement(element);
                    element.style.display = 'block';
                }else{
                    element.style.display = 'none';
                }
            }else{
                renderElement(element);
            }
        };
    }

    export function routeMatch(route){

        route = basepath+route;
        var path:any = window.location.pathname+window.location.search+window.location.hash;

        ////console.log(route);
        ////console.log(path);

        /* Old route-variables have to be cleared here*/

        route = route.split('/');
        path = path.split('/');

        if(path.length != route.length){
            return false;
        }

        for(var i in route){
            if(route[i] != path[i] && route[i][0] != ':'){
                return false;
            }
            if(route[i] != path[i] && route[i][0] == ':'){
                data[route[i]] = path[i];
            }
        }

        return true;
    }

    export function init(options = null){
        if(backup == null){
            backup = document.body.innerHTML;
        }

        if(basepath == null){
            if(options != null && options['base'] != null){
                basepath = options.base;
            }else{
                basepath = window.location.pathname+"/#!/";
                basepath = basepath.replace('//','/');
            }
        }

        var currentUrl = window.location.pathname+window.location.search+window.location.hash;
        if(currentUrl.length < basepath.length){
            ////console.log("REPLCE");
            //window.location.href = basepath;
            window.history.pushState("", "", basepath);
        }

        if(options['selector'] != null){
            selector = options['selector'];
        }


        elements = getElements(selector,document);
        setRouteRendering();
    }

    /** Re-renders an element. */
    export function update(element){
        if(!element || !element.backup) return;
        var tmp = document.createElement('div');
        tmp.innerHTML = element.backup;
        renderElement(tmp.firstChild);
        
        element.replaceWith(tmp.firstChild);  
        /*
        element = tmp.firstChild;   
        //element.outerHTML = element.backup;
        console.log("ELEMENT0",element);
        */
    }

    function renderElement(element){
        if(element.backup == null){
            element.backup = element.outerHTML.toString();
        }
        
        
        for (var att, i = 0, atts = element.attributes, n = atts.length; i < n; i++){
            att = atts[i];
            att.nodeValue = renderTemplate(att.nodeValue,data);
        }

        getElementTemplate(element,function(template){
            //console.log("getElementTemplateFinished:",element);
            element.innerHTML = template;
            getElementData(element,function(jdata){
                // render data if available
                if(jdata !== false){
                    //render array
                   
                    if(jdata.constructor === Array){
                        element.innerHTML = "";
                        for(let i in jdata){
                            element.innerHTML += renderTemplate(template,jdata[i]);
                        }
                    }
                    // render single object
                    else{
                        element.innerHTML = renderTemplate(template,jdata);
                    }
                }

                var tmp = element.innerHTML;
                element.innerHTML = renderTemplate(element.innerHTML,data);
                
                /* Evaluation of loaded scripts */
                /* TODO: Differ between inline and ajax request */
                /* TODO: src-loading */
                var scripts = element.getElementsByTagName('script');
                for(let script of scripts){
                    eval(script.innerHTML);
                }
                

            });
        });


    }


        function getElementTemplate(element,callback){
            var el = element;
            //console.log("origin element",element,element.hasAttribute('template'));
            // use innerHTML as template if there is no template-attr
            if(element.hasAttribute('template') == false){
                callback(element.innerHTML);
            }

            // get template-file from attr
            else{           
                var client = new XMLHttpRequest();
                
                client.open('GET', './'+element.getAttribute('template')+'.html',false);
                client.send();
                if(client.status === 200) {
                    callback(client.responseText);
                }
            }
        }

        function getElementData(element,callback){
            if(element.hasAttribute('data')){
                fetchJSONFile('./'+element.getAttribute('data')+'.json', function(jdata){
                    if(jdata.constructor === Array && element.getAttribute('select') != null){
                        

                        var selector = "id";

                        if(element.getAttribute('selector') != null){
                            selector = element.getAttribute('selector');
                        }

                        /*
                        if(element.getAttribute('selector') != null){
                            selector =  renderTemplate(element.getAttribute('selector'),window);
                        }
                        var select = renderTemplate(element.getAttribute('select'),window);
                        */

                        var select = element.getAttribute('select');

                        for(let i in jdata){
                            ////console.log(data[i][selector],select);
                            if(jdata[i][selector] == select ){
                                jdata = jdata[i];
                                break;
                            }
                        }
                        callback(jdata);
                    }
                    else if(jdata.constructor === Array && element.getAttribute('where') != null){
                        
                        var where = element.getAttribute('where');
                        var s = new Select(jdata);
                        jdata = s.where(where);
                        callback(jdata);
                    }
                    else{                     
                        callback(jdata);
                    }
                });

            }else{
                callback(false);
            }
        }
        


}