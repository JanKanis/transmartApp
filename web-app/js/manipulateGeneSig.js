var visualize = function(geneLists, action){
	
	var resultArray
	JS.require('JS.Set', function(){
		//-------Operate on the incoming lists.
		//Process gene lists and return a sets object with genelist id as the key and the set of genes as the value.
		var sets = processGeneLists(geneLists);
		
		//Perform the specified set operation and return result set in an array.
		resultArray = operate(sets, action);
		
		//Set the result as default value in the results text box
		setResults(resultArray.toString(), true);
		//-------Set operation done 
		
		//------Visualize the incoming lists.
		initializeColorMapping();
		
		mapSetIndexToGeneListId(geneLists);
		
		//Global variable: Calculate which genes are in the 7 possible regions on the venn diagram.
		region = calculateRegionMembers(sets);
		
		//Draw the venn diagram
		draw();
		//-------Set Visualization done
	});
}

/**
 * We deal with three sets.
 * Each set has an index (1 to 3)
 * This function creates a global variable to hold the mapping between set index and
 * the gene list id it represents. 
 */
function mapSetIndexToGeneListId(geneLists){
	//Global array setIndex
	setIndex = new Array();
	var count = 1;
	for(geneListId in geneLists){
		setIndex[count++] = geneListId;
	}
}

function calculateRegionMembers(sets){
	var region = new Object();
	//Region 1
	region['1']=calculateOuterRegionsMembers(sets, 1, 2, 3);
	
	//Region 2
	region['2']=calculateOuterRegionsMembers(sets, 2, 3, 1);
	
	//Region 3
	region['3']=calculateOuterRegionsMembers(sets, 3, 1, 2);
	
	//Region 123
	var innerRegionArray = operate(sets, "intersection")
	region['123']=innerRegionArray;
	var innerRegionSet = new JS.Set(innerRegionArray);
	
	//Region 12
	region['12']=calculateMiddleRegionsMembers(sets, 1, 2, innerRegionSet);
	
	//Region 13
	region['13']=calculateMiddleRegionsMembers(sets, 1, 3, innerRegionSet);
	
	//Region 23
	region['23']=calculateMiddleRegionsMembers(sets, 2, 3, innerRegionSet);
	
	return region;
}

function calculateOuterRegionsMembers(sets, primaryIdx, firstSubIdx, secondSubIdx){
	var primarySet = sets[setIndex[primaryIdx]];
	var firstSubSet = sets[setIndex[firstSubIdx]];
	var secondSubSet = sets[setIndex[secondSubIdx]];
	
	//Intersect primary and first sub
	var subset = new Object();
	subset[setIndex[primaryIdx]]=primarySet;
	subset[setIndex[firstSubIdx]]=firstSubSet;
	var aSet = operate(subset, "intersection");
	aSet = new JS.Set(aSet);
	
	//Intersect primary and second sub
	subset = new Object();
	subset[setIndex[primaryIdx]]=primarySet;
	subset[setIndex[secondSubIdx]]=secondSubSet;
	var bSet = operate(subset, "intersection");
	bSet = new JS.Set(bSet);
	
	//Union the two results
	var cSet = new Object();
	cSet.a=aSet;
	cSet.b=bSet;
	var dSet = operate(cSet, "union");
	dSet = new JS.Set(dSet);
	
	//Remove the union from primary
	var eSet = sets[setIndex[primaryIdx]].difference(dSet);
	
	return eSet.toArray();
}

function calculateMiddleRegionsMembers(sets, firstSetIdx, secondSetIdx, innerSet){
	var firstSet = sets[setIndex[firstSetIdx]];
	var secondSet = sets[setIndex[secondSetIdx]];
	
	//Intersect first and second set
	var subset = new Object();
	subset[setIndex[firstSetIdx]]=firstSet;
	subset[setIndex[secondSetIdx]]=secondSet;
	var aSet = operate(subset, "intersection");
	aSet = new JS.Set(aSet);
	
	//Remove intersection of all three sets from the above intersection
	var cSet = aSet.difference(innerSet);
	return cSet.toArray();
}


/**
 * Populates the results text box.
 */
function setResults(results, initializeGlobalArray){
	if(initializeGlobalArray){
		//Initialize the global array that will hold a list of active region ids
		activeRegionIds = new Array();
		var test = d3.select("#123");
		var i = 0;
	}
	jQuery("#manipulationResults").val(results);
}

/**
 * Clears out the New Gene List name field
 */
function resetGeneListName(){
	jQuery("#newGeneListName").val("");
}

/**
 * Exports the Venn diagram.
 */
function exportSVGImage(){
	
}

/**
 * Saves the new list.
 */
function saveNewList(){
	
}

/**
 * Uses JS.Set to create set objects 
 * @param geneLists
 */
function processGeneLists(geneLists){
	var sets=new Object();
	//Read genes array from json object
	for(geneListId in geneLists){
		var set = new JS.Set(geneLists[geneListId]);
		sets[geneListId]=set;
	}

	return sets;
}

/**
 * Reads in an object with all sets and performs the specified action
 * @param sets
 * @param action
 */
function operate(sets, action){
	var resultArray;
	var resultSet;
	var count = 0;
	
	if(action=='union' || action == 'intersection' || action == 'difference'){
		for(i in sets){
			if(count===0){
				resultSet = sets[i]
			}else{
				var evalResult = "resultSet = resultSet."+action+"(sets[i]);";
				eval(evalResult);
			}
			count++;
		}
		resultArray = resultSet.toArray();
	}else if(action == 'concat'){
		resultArray = new Array();
		for(i in sets){
			resultSet = sets[i];
			resultArray = resultArray.concat(resultSet.toArray());
		}
	}else if(action == 'unique'){
		var concatArray = operate(sets, 'concat');
		//keep doing this.
	}

	console.log(resultArray);
	return resultArray;
}

function draw(){
	//Clear out div before drawing SVG again.
	jQuery('#svg').empty();
	
	//Draw the venn diagram
	var w = 480, h = 290;

	var svg = d3.select("#svg").append("svg:svg")
    	.attr("width", w)
    	.attr("height", h);
	
	var defs = svg.append("svg:defs");

	defs.append("svg:clipPath")
    .attr("id", "circle1")
    .append("svg:circle")
    .attr("cx", 200)
    .attr("cy", 110)
    .attr("r", 90);

	defs.append("svg:clipPath")
    .attr("id", "circle2")
    .append("svg:circle")
    .attr("cx", 300)
    .attr("cy", 110)
    .attr("r", 90);

	defs.append("svg:clipPath")
    .attr("id", "circle3")
    .append("svg:circle")
    .attr("cx", 250)
    .attr("cy", 180)
    .attr("r", 90);

	svg.append("svg:rect")
    .attr("clip-path", "url(#circle1)")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "1")
    .style("fill", unselectedColorMapping["1"])
    .on("click", mouseclick);

	svg.append("svg:rect")
	.attr("clip-path", "url(#circle2)")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "2")
    .style("fill", unselectedColorMapping["2"])
    .on("click", mouseclick);

	svg.append("svg:rect")
    .attr("clip-path", "url(#circle3)")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "3")
    .style("fill", unselectedColorMapping["3"])
    .on("click", mouseclick);

	svg.append("svg:g")
    .attr("clip-path", "url(#circle1)")
    .append("svg:rect")
    .attr("clip-path", "url(#circle2)")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "12")
    .style("fill", unselectedColorMapping["12"])
    .on("click", mouseclick);

	svg.append("svg:g")
    .attr("clip-path", "url(#circle2)")
    .append("svg:rect")
    .attr("clip-path", "url(#circle3)")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "23")
    .style("fill", unselectedColorMapping["23"])
    .on("click", mouseclick);

	svg.append("svg:g")
    .attr("clip-path", "url(#circle3)")
    .append("svg:rect")
    .attr("clip-path", "url(#circle1)")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "13")
    .style("fill", unselectedColorMapping["13"])
    .on("click", mouseclick);

	svg.append("svg:g")
    .attr("clip-path", "url(#circle3)")
    .append("svg:g")
    .attr("clip-path", "url(#circle2)")
    .append("svg:rect")
    .attr("clip-path", "url(#circle1)")
    .attr("width", w)
    .attr("height", h)
	.attr("id", "123")
    .style("fill", unselectedColorMapping["123"])
    .on("click", mouseclick);
}

/**
 * add counts for each area
 */
function addCount(){
	addCount(svg, 150, 80, 2);
	addCount(svg, 245, 80, 1);
	addCount(svg, 340, 80, 1);
	addCount(svg, 190, 160, 1);
	addCount(svg, 245, 160, 1);
	addCount(svg, 290, 160, 2);
	addCount(svg, 240, 240, 1);
}

/**
 * add label for each set
 */
function addLabel(){
	addCount(svg, 50, 80, "List1");
	addCount(svg, 400, 80, "List3");
	addCount(svg, 225, 290, "List2");
}

/**
 * Handle mouseclick events for different regions in the Venn Diagram.
 * @param d
 * @param i
 */
function mouseclick(d, i){
	//Add or remove the region id from the active ids array
	var index = activeRegionIds.indexOf(this.id);
	//Add if doesn't allready exist
	if(index<0){
		activeRegionIds.push(this.id);
		this.style.fill= selectedColorMapping[this.id];
	}else{//Remove if it does exist
		activeRegionIds.splice(index,1);
		this.style.fill= unselectedColorMapping[this.id];
	}
	
	//Clear out the results text area
	setResults('', false);
	
	//Recreate the selection and put it in the test area
	var results = '';
	for(var i = 0;i<activeRegionIds.length; i++){
		var regionMembers = region[activeRegionIds[i]];
		if(regionMembers.length>0){
			if(results==''){
				results = results+region[activeRegionIds[i]];
			}else{
				results = results+','+region[activeRegionIds[i]];
			}
		}
	}
	setResults(results, false);
	
}

function addCount(svg, x, y, count){
	svg.append("svg:text")
	.attr("x",x)
	.attr("y",y)
	.text(count);
}

function initializeColorMapping(){
	selectedColorMapping = new Object();
	selectedColorMapping["1"]="#84A3FF";
	selectedColorMapping["2"]="#F76060";
	selectedColorMapping["3"]="#F5F847";
	selectedColorMapping["12"]="#F43471";
	selectedColorMapping["13"]="#69BEC3";
	selectedColorMapping["23"]="#FF7721";
	selectedColorMapping["123"]="#FF1818";
	
	unselectedColorMapping = new Object();
	unselectedColorMapping["1"]="#A4BAF7";
	unselectedColorMapping["2"]="#F79797";
	unselectedColorMapping["3"]="#F1F380";
	unselectedColorMapping["12"]="#CE7894";
	unselectedColorMapping["13"]="#9DB4B4";
	unselectedColorMapping["23"]="#F09154";
	unselectedColorMapping["123"]="#CB7575";
}
