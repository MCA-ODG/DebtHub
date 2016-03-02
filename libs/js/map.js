    
    // WINDOW LOADER (FOR INIT SINÓ BUCLE INFINIT)

    $(document).ready(function() {
	
        $("#element").css({ opacity: 0.8});
        $("#element").introLoader({

            animation: {
                name: 'simpleLoader',
                options: {
                    exitFx:'fadeOut',
                    ease: "easeInOutCirc",
                    style: 'dark',
                    delayBefore: 1500, //delay time in milliseconds
                    exitTime: 500
                }
            },    

            spinJs: { 
                lines: 10, // The number of lines to draw
                length: 15, // The length of each line
                width: 5, // The line thickness
                radius: 20, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                color: '#fff', // #rgb or #rrggbb or array of colors
            }
        
        });
        });

function init() { 
    
    // OPCIONS DEL GRÀFIC		
    var options2 = {
        chart: {
            renderTo: 'container2',            
            color: '#000',
            font: 'bold 11px Arial, Helvetica, sans-serif',
            backgroundColor: {
                linearGradient: [0, 0, 500, 500],
                stops: [
                    [0, 'rgb(255, 255, 255)'],
                    [1, 'rgb(240, 240, 255)']
                ]
            }
        },

        legend:{
                align: 'center',
                verticalAlign: 'bottom',
                layout:'horizontal'
        },

        title: {
            text: 'Central Government Debt',
            x: -20, //center,
            style: {
                color: '#000',
                font: 'bold 15px Arial, Helvetica, sans-serif',                
            }
        },

        subtitle: {            
            text: 'Source: World Bank Data',
            x: -20            
        },

        //xAxis: {
         //   categories: ['1990', '1991', '1992', '1993', '1994', '1995',
          //      '1996', '1997', '1998', '1999', '2000', '2001']
        //},

        xAxis: {
            tickInterval: 1,
            gridLineWidth: 1,
             
        },

        yAxis: {
            minorTickInterval: 'auto',
            title: {
                text: '% of GDP',
                
        },        

        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]

        },

        tooltip: {
            valueSuffix: '%',
            
        },

        series: [{
            name:'',
            data: []
        }, {
            name:'',
            data: [],
        }, {
            name:'',
            data: []           
        }]    

    };

    //Nou mapa
    var map = new L.Map('map', {
        center: [36.989033, -43.430536],
        zoom: 3,
        minZoom: 3,    
        maxZoom: 7,
        zoomControl: false
    });

    //Afegir al mapa la barra lateral
    var sidebar = L.control.sidebar('sidebar').addTo(map);

    //Full extent button
    var home = {
    	lat: 36.989033,
    	lng: -43.430536,
    	zoom: 3,
    	stateName: 'home'
    };

    L.easyButton ('fa-globe', function(btn,map){
    	map.setView([home.lat, home.lng], home.zoom);
    }, 'Zoom To Home').addTo(map); 

  	// Es crea manualment un control de zoom
    var zoomControl = L.control.zoom({
        position: 'topright'
    });
    map.addControl(zoomControl);
    
    // LoadingControl
    var loadingControl = L.Control.loading({
        position: 'topright',
        zoomControl: zoomControl
    });
    map.addControl(loadingControl);  
    
    //capa base
    var basemap =  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
	}).addTo(map);     
    
    //estil capa geojson
    var myStyle = {
        "color": "#d3d3d3",
        "weight":1,
        "fillOpacity": 0.3
    };		

    //INICI INTERACCIO

	var world;
	
	//Quan es pasa el cursor sobre el pais, l'ilumina
	function highlightFeature(e) {
		var layer = e.target;

		//estil de la capa quan s'hi passa el ratolí  sobre
		layer.setStyle({
			color: '#0074d9',
			dashArray: '',
			fillOpacity: 0.4,
            weight:0.5
		});

		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}
		
		var iso3 = e.target.feature.properties.iso3;
		//crido a una funció que retorna el valor de GDP (que no sé que és però és un indicador) de l'any més actual del pais clicat
		//retornaGDP(iso3);
		var propietats = layer.feature.properties;		
		
		//Actualitza el panell sobre el panell info
		info.update(layer.feature.properties);
	}

	//Quan el cursor surt del país reset estil original i actualitza panell
	function resetHighlight(e) {

		world.resetStyle(e.target);
		info.update();
	}
	
    //Quan es clica damunt el pais, zoom (fitbounds)
	function clickToFeature(e) {		
		map.fitBounds(e.target.getBounds());
        
		//crida a funció que retorna indicador GDP del pais clicat
		//li passa l'objecte senser amb totes les propietats (atributs de l'element)
		//perquè desde la funció retornaGDP el que es fa és actualitzar el panell dinàmic info.
		// Crida a funcio que retorna el GDP del pais clicat

		retornaGDP(e.target.feature.properties);    
        retornaCGD(e.target.feature.properties);
        retornaHealth(e.target.feature.properties);
		
	}

	//Quan la capa esta carregada, a cada acció (ej:mouseover) excuta una funcio (ej:highlightFeature)
	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: clickToFeature
		});     		
	}

	//FINAL INTERACCIO

	
	//INICI CONTROL INFO

    //Leaflet Info Control
	var info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	//method that we will use to update the control based on feature properties passed
	info.update = function (props) {	

            var indGDP = '';
            if (props) {
                if (props.valorGDP) {
                    indGDP = '<br />GDP: ' + props.valorGDP;
                }
            }
			
			this._div.innerHTML = /*'<h4>Basic Information</h4>' + */ (props ?
        '<h5>' + props.name + '</h5><br>' +
        '<b>Surface area:  </b>' + props.indicado_1 + ' km <sup>2</sup><br>' +
        '<b>Population, total (2014):  </b>' + props.indicado_2 + '<br>' +
        '<b>Income Level:  </b>' + props.indicado_3 + '<br>' +
        '<b>Lending Type: </b>' + props.indicado_4 + '<br>' +
        '<b>GDP (2014):  </b>' + props.indicado_5 + ' US$ Trillions<br>' +
        '<b>GDP per capita (2014):  </b>' + props.indicado_6 + ' US$<br>' +
        '<b>Life Expectancy at birth (2013):  </b>' + props.indicado_7+ ' years<br>' +
        '<b>GEE, % of GDP (2010): </b>' + props.indicado_8 + '<br>' +
        '<b>Net ODA & OA received (2013):  </b>' + props.indicadors + ' US$<br>' +
        '<b>Internet users per 100 people (2014):  </b>' + props.indicado_9 + '<br>' +
        '<b>Oil rents, % of GDP (2013):  </b>' + props.indicado10 + '<br>' + 

        '<br><b style="color:#0074d9"> World Development Indicators</b>'

        : 'Hover over a Country');	
	};
	info.addTo(map);

  	//FINAL INFO CONTROL
		
    //declar objecte geojson + properties
    world = L.geoJson(world, {
        style: myStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

    //càrrega del geojson
    $.getJSON('geojson/world_v8.geojson', function(data) {
        world.addData(data);
    });

	
	//INICI FUNCIÓ RECUPERACIÓ INDICADOR
     
  

	function retornaGDP (props) {	
		
	   // At least for now, the World Bank has a nasty bug in their
        // API implementation. Their server converts the NAME of the
        // JSONP callback function to lowercase. By default, jQuery
        // uses a callback function of the form `jQuery9876_1234`
        // (except the number strings are **much** longer) and so
        // the JSONP response that the World Bank returns fails
        // trying to execute `jquery9876_1234`. To workaround this
        // bug, we'll intercept all of jQuery's AJAX calls before
        // they're executed. We look for the World Bank callback
        // parameter `prefix=` and, if it's present and the value isn't
        // lowercase, create a lowercase wrapper function around the
        // real callback that jQuery has created.
     
        //Funció per tractar el retorn com a lowercase (minuscules)
        $.ajaxSetup({
          beforeSend: function(xhr, settings) {
            var prefix = settings.url.match(/prefix=(.*?)&/);
            if (prefix.length > 1) {
              var callback = prefix[1];
              if (callback !== callback.toLowerCase()) {
                window[callback.toLowerCase()] =
                  new Function("response", callback + "(response)");
              }
            }
          }
        });
       
       //Government expenditure on education, total (% of GDP) 
        var RequestGDP = $.getJSON(
            "http://api.worldbank.org/countries/"
                + props.iso2 
                + "/indicators/SE.XPD.TOTL.GD.ZS?prefix=?",
                { format: "jsonp", date:"2000:2014", per_page: 9999 }
        );
       
		var valorGDP;
               
        RequestGDP.done(function(response) {
            
            var dades = new Array();
			for (var i = 0; i < response[1].length; i++) {
				var parell = new Array (parseInt(response[1][i].date), parseFloat(response[1][i].value));
                dades.sort(parell);
				dades.push(parell);                

                //dades.push(parseFloat(response[1][i].value));
			}

			//això ja t'ho fa bé, el que passa és que et retorna les dades pel pais indicat de tots els anys
			//a response [0] hi ha dades de l'indicador demanat
			//a response [1] ja hi ha tots els valors pel pais demanat
			//a response [1][0] hi ha les dades de l'indicador per a l'últim any

            //alert(response[1][0].value);
			//valorGDP = response [1][0].value;

			//aquí afegeixo nova propietat a props
			//props.valorGDP = valorGDP;

			//actualitza div info amb els valors que ja tenia, més el valor de l'indicador
			//info.update(props);       	
						
            // DIFERENTS SERIES (0,1,2, ETC.)
			//options.series[0].data = dades;	
            //options.series[0].name = 'GEE';
            //options.series[1].name = 'CGD';
            //options.series[2].name = 'aaaaa';    
			options2.series[1].data = dades;
            options2.series[1].name = 'GEE';
            options2.series[1].type = 'column';
           
           		
            

        });
			
	}

    function retornaHealth (props) {             
     
        //Funció per tractar el retorn com a lowercase (minuscules)
        $.ajaxSetup({
          beforeSend: function(xhr, settings) {
            var prefix = settings.url.match(/prefix=(.*?)&/);
            if (prefix.length > 1) {
              var callback = prefix[1];
              if (callback !== callback.toLowerCase()) {
                window[callback.toLowerCase()] =
                  new Function("response", callback + "(response)");
              }
            }
          }
        });
       
       //Health expenditure, total (% of GDP) 
        var RequestHealth = $.getJSON(
            "http://api.worldbank.org/countries/"
                + props.iso2 
                + "/indicators/SH.XPD.TOTL.ZS?prefix=?",
                { format: "jsonp", date:"2000:2014", per_page: 9999 }
        );
       
        var valorHealth;
               
        RequestHealth.done(function(response) {       
			var dades3 = new Array();		
            for (var i = 0; i < response[1].length; i++) {
                var parell3 = new Array (parseInt(response[1][i].date), parseFloat(response[1][i].value));
                dades3.sort(parell3);
                dades3.push(parell3);  
            }  

			options2.series[2].data = dades3;
            options2.series[2].name = 'HE';
            options2.series[2].type = 'column';   	
			var chart2 = new Highcharts.chart(options2);   			

        });
            
    }

    function retornaCGD (props) { 

        // Lowercase Setup
        $.ajaxSetup({
          beforeSend: function(xhr, settings) {
            var prefix = settings.url.match(/prefix=(.*?)&/);
            if (prefix.length > 1) {
              var callback = prefix[1];
              if (callback !== callback.toLowerCase()) {
                window[callback.toLowerCase()] =
                  new Function("response", callback + "(response)");
              }
            }
          }
        });  
            
        //Central Government Debt, total (% of GDP)
        var reqCGD = $.getJSON(
            "http://api.worldbank.org/countries/"
                + props.iso2
                + "/indicators/GC.DOD.TOTL.GD.ZS?prefix=?",
                { format: "jsonp", date:"2000:2014", per_page: 9999 }
        );

        var valorCGD;

        reqCGD.done(function(response) {
            var dades2 = new Array();
            for (var i = 0; i < response[1].length; i++) {
                var parell2 = new Array (parseInt(response[1][i].date), parseFloat(response[1][i].value));
                dades2.push(parell2);
                dades2.sort(parell2);               
            }

            //valorCGD = response[1][0].value; 
            //props.valorCGD = valorCGD; 

            options2.series[0].data = dades2; 
            options2.series[0].name = 'CGD';
            options2.series[0].type = 'line';

                  
          
           
          
                                           
        });                                           
    }

}  



       

    
    