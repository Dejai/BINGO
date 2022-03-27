/**********************************************************************************************************
	Author: Derrick Fyfield
	Purpose:
		This "common" script will house things that I would want to reuse throughout this local server

**********************************************************************************************************/

// customObject = Pass in a custom object with variables/values that you would want to use with the data returned from the ajax call 

/*
	This object is used to make local server AJAX calls easier; 
*/

// EXTENSION METHODS 
	if (typeof Array.prototype.contains !== "function"){ Array.prototype.contains = function(value){ return this.includes(value); } }
	if (typeof Object.prototype.contains !== "function"){ Object.prototype.contains = function(value) { return this[value] != undefined; } }

const mydoc = {

	ready: function(callback){
		document.addEventListener("DOMContentLoaded", callback);
	},

	loadContent: function(content, identifier)
	{
		element = document.getElementById(identifier);
		if(element != undefined)
		{
			element.innerHTML = content;
		}
	},

	// Show content based on query selector
	showContent: function(selector){
		this._toggleClass(selector, "remove", "hidden");
	},

	// Hide based on query selector
	hideContent: function(selector){
		this._toggleClass(selector, "add", "hidden");
	},

	addClass: function(selector, className){
		this._toggleClass(selector, "add", className);
	},

	removeClass: function(selector, className){
		console.log(selector + " " + className);
		this._toggleClass(selector, "remove", className);
	},

	get_query_map: function(){
		let query_string = location.search;
		let query = query_string.replace("?", "")
		var query_map = {}
		var combos = query.split("&");
		combos.forEach(function(obj)
		{
			let splits = obj.split("=");
			query_map[splits[0]] = splits[1];
		});
		return query_map;
	},

	get_query_param: function(key){
		let map = mydoc.get_query_map();
		let value = undefined;
		if(map.hasOwnProperty(key))
		{
			value = map[key]
		}
		return value;
	},
	
	_toggleClass: function(selector, action, className){
		try
		{
			let elements = Array.from(document.querySelectorAll(selector));
			if(elements != undefined)
			{
				elements.forEach(function(obj){
					if(action == "add")
					{
						obj.classList.add(className);
					}
					else if(action == "remove")
					{
						obj.classList.remove(className);
					}
				});
			}
		} 
		catch(error)
		{
			Logger.log(error, true);
		}
	}

};

const myajax = { 
	
	GetContentType: function(type){
		switch(type){
			case "JSON":
			case "json":
				return "application/json";
			default:
				return "text/plain";
		}
	},

	isValidAjaxObject: function(object){
		let state = {isValid: true, message:"All set"};

		if ( !object.contains("type") )
		{
			state.isValid = false;
			state.message = "Missing TYPE of call (GET vs. POST)";
			return state;
		}

		if (object["type"] == "POST" && !object.contains("data"))
		{
			state.isValid = false;
			state.message = "Doing a POST - but with no data";
		}

		return state;
	},

	AJAX: function(object){
		let checkObject = myajax.isValidAjaxObject(object);
		if (!checkObject.isValid){
			throw new Error(checkObject.message);
		}

		// Getting/Setting the parts of the call
		let method 	= object["type"];
		let url 	= object["url"];

		let success = object.contains("success") ? object["success"] : function(request){console.log(request);};
		let failure = object.contains("failure") ? object["failure"] : function(request){console.log(request);};

		// Setting up the request object
		var xhttp = new XMLHttpRequest();
		xhttp.open(method, url, true);

		// What to do after the call is made
		xhttp.onreadystatechange = function() {
			request = this;
			if (request.readyState == 4 && request.status == 200)
			{
				success(request);
			}
			else if (request.readyState == 4 && request.status != 200)
			{
				failure(request);
			}
		};

		// Send/proces the request
		if ( object.contains("data") )
		{
			let data = object["data"];
			xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhttp.send(data);
		}
		else
		{
			xhttp.send();
		}
	}

}

const Helper = {

	getDate: function(format=undefined){
		let dd = new Date();

		// Get the year; Replaces "yyyy" or "YYYY" in the format;
		let year = dd.getFullYear().toString();
		
		// Get the month; Replaces "MM" in the format
		let monthIdx = dd.getMonth()+1;
		let month = (monthIdx < 10) ? "0"+monthIdx : monthIdx;
		
		// Get the day of the month; Replaces "dd" in the format
		let dayIdx = dd.getDate();
		let day = (dayIdx < 10) ? "0"+dayIdx : dayIdx;
		
		// Get the hour; Replaces "H" in the format;
		let hour24 = dd.getHours();
		let hour = hour24 > 12 ? hour24 - 12 : hour24;
		hour = (hour < 10) ? "0"+hour : hour;

		// Get the minute; Replaces "m" in the format;
		let minute = dd.getMinutes();
		minute = (minute < 10) ? "0"+minute : minute;

		// Get the seconds; Replaces "s" in the format;
		let seconds = dd.getSeconds();
		seconds = (seconds < 10) ? "0"+seconds : seconds;
		
		// Get the state of the day (AM vs PM); Replaces "K" in the format
		let state = (hour24 >= 12) ? "PM" : "AM";

		// What to return;
		var result = undefined; 
		if(format != undefined)
		{
			let dt = format.replace("YYYY",year)
					.replace("yyyy",year)
					.replace("MM",month)
					.replace("dd",year)
					.replace("H",hour)
					.replace("m",minute)
					.replace("s",seconds)
					.replace("K",state);
			
			result = dt;
		}
		else
		{
			var dateObj = { 
							"year":year,
							"month":month,
							 "day":day,
							"hour":hour,
							"minute":minute,
							"seconds":seconds,
							"state":state
						};
			result = dateObj;
		}

		return result;
	}
}