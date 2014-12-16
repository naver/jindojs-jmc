YUI.add('api-search', function(Y) {
    
    var tabname = null;

    Y.APISearch = function() {};
    
    function toSingular(p) {
        
        var s = p.replace(/s$/, ''); 
        
        return {
            'classe' : 'class',
            'propertie' : 'property',
            'attr' : 'attribute'            
        }[s] || s;
        
    };
    
    function toPlural(s) {
        
        var p = s + 's'; 
        
        return {
            'classs' : 'classes',
            'propertys' : 'properties',
            'attributes' : 'attrs'            
        }[p] || p;
        
    };
    
    Y.APISearch.prototype.changeTab = function(name) {
        tabname = name;
        refreshResults();
    };

    var Search      = Y.namespace('Search'),
        inputNode   = Y.one('#api-filter'),
        resultNode  = {
            keywords : Y.one('#api-keywords'),
            classes : Y.one('#api-classes'),
            methods : Y.one('#api-methods'),
            properties : Y.one('#api-properties'),
            attrs : Y.one('#api-attrs'),
            events : Y.one('#api-events')
        },
        searchingNode = Y.one('#api-tabview'),
        notSearchingNode = Y.one('#no-search');
    
    var data = Y.YUIDoc;
    var MAXIMUM = 15;
    
    searchingNode.hide();
    
    function highlightMatch(sStr, sNeedle) {
        
        var bMatch = false;
        var sRegNeedle = sNeedle.replace(/([\?\.\*\+\-\/\(\)\{\}\[\]\:\!\^\$\\\|])/g, "\\$1");
        
        var sRet = sStr.replace(new RegExp(sRegNeedle, 'i'), function(_) {
            bMatch = true;
            return '<strong>' + _ + '</strong>';
        });
        
        return bMatch ? sRet : null;
        
    }    
    
    function getResults(data, field, value) {
        
        var result = null;
        if (!value) { return result; }
        
        var lists = data.detail[field] || [];
        for (var i = 0, len = lists.length; i < len; i++) {
            
            var item = lists[i];
            var matchName = highlightMatch(item.name, value);
            
            if (!matchName) { continue; }
            
            item.matchName = matchName;
            
            result = result || [];
            result.push(item);
            
            if (result.length === MAXIMUM) {
                break;
            }
            
        }
        
        return result;
        
    }
    
    var memberAnchor = function(item, itemtype) {
        return projectRoot + 'classes/' + item['class'] + '.html#' + toSingular(itemtype) + '_' + item.name
    };
    
    var memberDetail = function(item, itemtype) {
        return [
            item.description ? '<div class="description">' + item.description.replace(/<[^>]+>/g, '') + '</div>' : '',
            '<span class="className">' + item['class'] + '</span>'
        ].join('');
    };
    
    var typeAnchors = {
        'keywords' : function(item) { return projectRoot + 'keywords/' + item.name + '.html'; },
        'classes' : function(item) { return projectRoot + 'classes/' + item.name + '.html'; },
        'modules' : function(item) { return projectRoot + 'modules/' + item.name + '.html'; },
        'methods' : memberAnchor,
        'properties' : memberAnchor,
        'attrs' : memberAnchor,
        'events' : memberAnchor        
    };

    var typeDetails = {
        'keywords' : function(item) {
            var html = [ '<ul>' ];
            for (var i = 0, len = item['class'].length; i < len; i++) {
                html.push('<li>' + item['class'][i] + '</li>');   
            }
            html.push('</ul>');
            return html.join('');  
        },
        'classes' : function(item) { return item.description ? '<div class="description">' + item.description.replace(/<[^>]+>/g, '') + '</div>' : ''; },
        'modules' : function(item) { return ''; },
        'methods' : memberDetail,
        'properties' : memberDetail,
        'attrs' : memberDetail,
        'events' : memberDetail
    };
    
    function refreshResults() {
        
        var value = inputNode._node.value;
        if (value) {
            searchingNode.show();
            notSearchingNode.hide();
        } else {
            searchingNode.hide();
            notSearchingNode.show();
        }
        
        var html = [];

        var results = getResults(data, tabname, value) || [];
        for (var j = 0, cnt = results.length; j < cnt; j++) {
            
            var item = results[j];
            
            html.push([
                '<li class="result">',
                    '<a href="' + typeAnchors[tabname](item, tabname) + '">',
                        '<h3 class="title">' + item.matchName + '</h3>',
                        '<span class="type">' + toSingular(tabname) + '</span>',
                        typeDetails[tabname](item, tabname),
                    '</a>',
                '</li>'
            ].join(''));
        }
        
        if (!results.length) {
            html.push('<li class="no-result">No results found.</li>');   
        }
        
        resultNode[tabname].setHTML(html.join(''));        
        
    }
    
    inputNode.on('keyup', refreshResults);
    inputNode.on('click', refreshResults);
        
}, '0.0.1', {
    requires : [ ]
});
