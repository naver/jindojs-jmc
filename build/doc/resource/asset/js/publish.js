/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet, context) {
	
	publish.conf = JSDOC.opt.D;
	publish.conf.resultDir = JSDOC.opt.d;
	publish.conf.templatesDir = JSDOC.opt.t;
	
	// is source output is suppressed, just display the links to the source file
	if (JSDOC.opt.s && defined(Link) && Link.prototype._makeSrcLink) {
		Link.prototype._makeSrcLink = function(srcFilePath) {
			return "&lt;"+srcFilePath+"&gt;";
		}
	}
	
	// used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;

	// some ustility filters
	function hasNoParent($) {return ($.memberOf == "")}
	function isaFile($) {return ($.is("FILE"))}
	function isaClass($) {return ($.is("CONSTRUCTOR") || $.isNamespace)}
	
	// get an array version of the symbolset, useful for filtering
	var symbols = symbolSet.toArray();
	
	// create the hilited source code files
	var files = JSDOC.opt.srcFiles;
 	
 	// get a list of all the classes in the symbolset
 	var classes = symbols.filter(isaClass).sort(makeSortby("alias"));
	
	// create each of the class pages
	for (var i = 0, l = classes.length; i < l; i++) {
		var symbol = classes[i];
		//skip
		if (symbol.alias == "_global_") continue;
		
		symbol.events = symbol.getEvents();   // 1 order matters
		symbol.methods = symbol.getMethods(); // 2
		symbol.borrowedMethods = symbol.methods.filter(function($){return $.memberOf != symbol.alias }).sort(makeSortby("name"));
		symbol.methods = sortByType(symbol.methods.filter(function($){return $.memberOf == symbol.alias && !$.isNamespace}).sort(makeSortby("name")));

		// create a class index, displayed in the left-hand column of every class page
		Link.base = "../";
		var classTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + symbol.alias + "/index.html");
		var output = classTemplate.process(symbol);
		
		// becauseof include(), parse again!
		classTemplate.template = output;
		classTemplate.parse();
		output = classTemplate.process(symbol);
		
		IO.mkPath((publish.conf.resultDir + symbol.alias).split("/"));
		IO.saveFile(publish.conf.resultDir + symbol.alias, "index.html", output);
	}
	

	/**
	 * COPY RESOURCES
	
	print ("\nCopy resources like CSS and images =========\n");
	IO.mkPath((publish.conf.resourceDir + "css").split("/"));
	IO.copyFile(publish.conf.templatesDir + "resource/css/doc.css", publish.conf.resourceDir + "css");
	 */
}

/** static, public, deprecated 순으로 정렬 */
function sortByType(a) {
	var aStatic = [], aPublic = [], aDeprecated = [];
	for (var i = 0, nLen = a.length, oMethod; i < nLen; i++) {
		oMethod = a[i];
		if (oMethod.isStatic) {
			aStatic.push(oMethod);
			continue;
		}
		if (oMethod.deprecated) {
			aDeprecated.push(oMethod);
			continue;
		}
		aPublic.push(oMethod);
	}
	return [].concat(aStatic).concat(aPublic).concat(aDeprecated);
}

function makeInheritsList(borrowedMethods) {
	var contributers = [];
	borrowedMethods.map(function($) {
		if (contributers.indexOf($.memberOf) < 0) {
			contributers.push($.memberOf)
		}
	});
	
	var output = "";
	for (var i = 0, l = contributers.length; i < l; i++) {
		output +=
			"<p><strong>"+new Link().toSymbol(contributers[i])+"</strong> : " +
			borrowedMethods.filter(function($) { return $.memberOf == contributers[i] })
			.sort(makeSortby("name"))
			.map(function($) { return new Link().toSymbol($.alias).withText($.name) })
			.join(", ")
			+
			"</p>";
	}
	return output;
}

/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if (typeof desc != "undefined")
		return desc.match(/([\w\W]+?\.)[^a-z0-9_$]/i)? RegExp.$1 : desc;
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	}
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	var path = publish.conf.templatesDir+path;
	return IO.readFile(path);
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	if (!params) return "()";
	var signature = "("
	+
	params.filter(
		function($) {
			return $.name.indexOf(".") == -1; // don't show config params in signature
		}
	).map(
		function($) {
			return $.name;
		}
	).join(", ")
	+
	")";
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+) ?\}/gi,
		function(match, symbolName) {
			return new Link().toSymbol(symbolName);
		}
	);
	
	return str;
}

function hasModule(item) {
  return typeof item.augments[0] != 'undefined';  
}

function getModule(item) {
	return typeof item.augments[0] != 'undefined' ? item.augments[0] : '';
}

function getPrivateClass(item) {
  return (item.isPrivate || item.name.charAt(0) == '_') ? ' private' : '';
}

function getDesc(item) {
  return resolveLinks(summarize(item.desc));
}

function getPlainDesc(item) {
  var desc = summarize(item.desc);
  return desc.replace(/<.*?>/g, '').replace(/\{\@link\s*(.*?)\}/g, '$1');
}

function getNSClass(item) {
  if (item.isNamespace) {
    if (item.alias == "jProton" || item.alias == "jProton.ajax") 
      return " namespace-function";
      
    return " namespace";
  } else
    return "";
}
