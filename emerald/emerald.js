var Emerald;
(function (Emerald) {
    var selector = "emerald";
    var elements;
    var basepath;
    var backup;
    Emerald.data = {};
    window.onpopstate = function () {
        document.body.innerHTML = backup;
        init(basepath);
    };
    function getElements(selector, source) {
        var elements;
        if (selector[0] == '.') {
            elements = source.getElementsByClassName(selector.substring(1));
        }
        else if (selector[0] == '#') {
            elements = source.getElementById(selector.substring(1));
        }
        else {
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
            if (callback)
                callback(data);
        }
    }
    function renderTemplate(template, data) {
        if (!template)
            return template;
        return template.replace(/{{([a-zA-Z0-9-_:]+?)}}/g, function (match, key) {
            return (data && data[key] !== undefined) ? data[key] : match;
        });
    }
    /** Returns the nth element of the url */
    function getUrlParam(index) {
        var negative = false;
        var url = window.location.pathname + window.location.search + window.location.hash;
        var params = url.split('/');
        if (params[0] == '') {
            params.shift();
        }
        if (params[params.length - 1] == '') {
            params.pop();
        }
        ////console.log(params);
        if (index < 0) {
            return params[params.length + index];
        }
        return params[index];
    }
    function setRouteRendering() {
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (element.hasAttribute('route')) {
                ////console.log("route-attr",element.getAttribute('route'));
                ////console.log("result: ",routeMatch(element.getAttribute('route')));
                if (routeMatch(element.getAttribute('route')) == true) {
                    //console.log("RouteMatch",element);
                    renderElement(element);
                    element.style.display = 'block';
                }
                else {
                    element.style.display = 'none';
                }
            }
            else {
                renderElement(element);
            }
        }
        ;
    }
    function routeMatch(route) {
        route = basepath + route;
        var path = window.location.pathname + window.location.search + window.location.hash;
        ////console.log(route);
        ////console.log(path);
        /* Old route-variables have to be cleared here*/
        route = route.split('/');
        path = path.split('/');
        if (path.length != route.length) {
            return false;
        }
        for (var i in route) {
            if (route[i] != path[i] && route[i][0] != ':') {
                return false;
            }
            if (route[i] != path[i] && route[i][0] == ':') {
                Emerald.data[route[i]] = path[i];
            }
        }
        return true;
    }
    Emerald.routeMatch = routeMatch;
    function init(options) {
        if (options === void 0) { options = null; }
        if (backup == null) {
            backup = document.body.innerHTML;
        }
        if (basepath == null) {
            if (options != null && options['base'] != null) {
                basepath = options.base;
            }
            else {
                basepath = window.location.pathname + "/#!/";
                basepath = basepath.replace('//', '/');
            }
        }
        var currentUrl = window.location.pathname + window.location.search + window.location.hash;
        if (currentUrl.length < basepath.length) {
            ////console.log("REPLCE");
            //window.location.href = basepath;
            window.history.pushState("", "", basepath);
        }
        if (options['selector'] != null) {
            selector = options['selector'];
        }
        elements = getElements(selector, document);
        setRouteRendering();
    }
    Emerald.init = init;
    /** Re-renders an element. */
    function update(element) {
        if (!element || !element.backup) return;
        var tmp = document.createElement('div');
        tmp.innerHTML = element.backup;
        renderElement(tmp.firstChild);
        element.replaceWith(tmp.firstChild);
    }
    Emerald.update = update;
    function renderElement(element) {
        if (element.backup == null) {
            element.backup = element.outerHTML.toString();
        }
        for (var att, i = 0, atts = element.attributes, n = atts.length; i < n; i++) {
            att = atts[i];
            att.nodeValue = renderTemplate(att.nodeValue, Emerald.data);
        }
        getElementTemplate(element, function (template) {
            //console.log("getElementTemplateFinished:",element);
            element.innerHTML = template;
            getElementData(element, function (jdata) {
                // render data if available
                if (jdata !== false) {
                    //render array
                    if (jdata.constructor === Array) {
                        element.innerHTML = "";
                        for (var i_1 in jdata) {
                            element.innerHTML += renderTemplate(template, jdata[i_1]);
                        }
                    }
                    else {
                        element.innerHTML = renderTemplate(template, jdata);
                    }
                }
                var tmp = element.innerHTML;
                element.innerHTML = renderTemplate(element.innerHTML, Emerald.data);
                /* Evaluation of loaded scripts */
                /* TODO: Differ between inline and ajax request */
                /* TODO: src-loading */
                var scripts = element.getElementsByTagName('script');
                for (var _i = 0, scripts_1 = scripts; _i < scripts_1.length; _i++) {
                    var script = scripts_1[_i];
                    eval(script.innerHTML);
                }
            });
        });
    }
    function getElementTemplate(element, callback) {
        var el = element;
        //console.log("origin element",element,element.hasAttribute('template'));
        // use innerHTML as template if there is no template-attr
        if (element.hasAttribute('template') == false) {
            callback(element.innerHTML);
        }
        else {
            var client = new XMLHttpRequest();
            client.open('GET', './' + element.getAttribute('template') + '.html', false);
            client.send();
            if (client.status === 200) {
                callback(client.responseText);
            }
        }
    }
    function getElementData(element, callback) {
        if (element.hasAttribute('data')) {
            fetchJSONFile('./' + element.getAttribute('data') + '.json', function (jdata) {
                if (jdata.constructor === Array && element.getAttribute('select') != null) {
                    var selector = "id";
                    if (element.getAttribute('selector') != null) {
                        selector = element.getAttribute('selector');
                    }
                    /*
                    if(element.getAttribute('selector') != null){
                        selector =  renderTemplate(element.getAttribute('selector'),window);
                    }
                    var select = renderTemplate(element.getAttribute('select'),window);
                    */
                    var select = element.getAttribute('select');
                    for (var i in jdata) {
                        ////console.log(data[i][selector],select);
                        if (jdata[i][selector] == select) {
                            jdata = jdata[i];
                            break;
                        }
                    }
                    callback(jdata);
                }
                else if (jdata.constructor === Array && element.getAttribute('where') != null) {
                    var where = element.getAttribute('where');
                    var s = new Emerald.Select(jdata);
                    jdata = s.where(where);
                    callback(jdata);
                }
                else {
                    callback(jdata);
                }
            });
        }
        else {
            callback(false);
        }
    }
})(Emerald || (Emerald = {}));
var Emerald;
(function (Emerald) {
    var Select = (function () {
        function Select(json) {
            this.data = json;
        }
        Select.prototype.where = function (query) {
            var output = [];
            for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
                var e = _a[_i];
                var result = this.evaluate(e, query);
                if (result == true) {
                    output.push(e);
                }
                if (result == null) {
                    return null;
                }
            }
            return output;
        };
        ;
        Select.prototype.evaluate = function (item, query) {
            var evaluationQuery = query;
            var result;
            result = query.match(/(NOT )?[a-z0-9_:]+( )*?(LIKE|<=|>=|<>|!=|=|<|>)( )*?(((')((\\')|[^'])*('))|([0-9]+))/gi);
            if (result == null) {
                console.error('Evaluation Error: Could not parse:"' + query + '".');
                return false;
            }
            for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                var evl = result_1[_i];
                var splitted = evl.split(/(LIKE|<=|>=|!=|<>|<|>|=)/);
                for (var i in splitted) {
                    splitted[i] = splitted[i].trim();
                    if (splitted[i][0] == "'") {
                        splitted[i] = splitted[i].substring(1);
                    }
                    if (splitted[i][splitted[i].length - 1] == "'") {
                        splitted[i] = splitted[i].substring(0, splitted[i].length - 1);
                    }
                }
                //console.log("SPLITTED",splitted);
                var selector = splitted[0];
                var operator = splitted[1];
                var value = splitted[2];
                var returnValue = null;
                switch (operator) {
                    case '=':
                        if (item[selector] == value) {
                            returnValue = 'true';
                        }
                        else {
                            returnValue = 'false';
                        }
                        break;
                    case '<>':
                    case '!=':
                        if (item[selector] != value) {
                            returnValue = 'true';
                        }
                        else {
                            returnValue = 'false';
                        }
                        break;
                    case '>':
                        if (item[selector] > value) {
                            returnValue = 'true';
                        }
                        else {
                            returnValue = 'false';
                        }
                        break;
                    case '<':
                        if (item[selector] < value) {
                            returnValue = 'true';
                        }
                        else {
                            returnValue = 'false';
                        }
                        break;
                    case '>=':
                        if (item[selector] >= value) {
                            returnValue = 'true';
                        }
                        else {
                            returnValue = 'false';
                        }
                        break;
                    case '<=':
                        if (item[selector] <= value) {
                            returnValue = 'true';
                        }
                        else {
                            returnValue = 'false';
                        }
                        break;
                    case 'LIKE':
                        var regexValue = value;
                        regexValue = regexValue.replace(/%/g, "(.)*");
                        regexValue = regexValue.replace(/_/g, "(.)");
                        regexValue = RegExp(regexValue, 'gi');
                        if (item[selector].match(regexValue) != null) {
                            returnValue = 'true';
                        }
                        else {
                            returnValue = 'false';
                        }
                        break;
                    default:
                        console.error('Evaluation Error: Unknown operator "' + operator + '" in "' + query + '".');
                        return null;
                }
                //console.log("________",query,"_",evl,"_",returnValue);
                if (returnValue != null) {
                    evaluationQuery = evaluationQuery.replace(evl, returnValue);
                }
                //console.log(splitted);
            }
            evaluationQuery = evaluationQuery.replace(' OR ', ' || ');
            evaluationQuery = evaluationQuery.replace(' AND ', ' && ');
            //console.log("Result:",query);
            //console.log("Final query:",query)
            return eval(evaluationQuery);
        };
        return Select;
    }());
    Emerald.Select = Select;
})(Emerald || (Emerald = {}));
//# sourceMappingURL=emerald.js.map