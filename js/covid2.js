(function() { 

// Create the connector object var myConnector = tableau.makeConnector();
// Define the schema
myConnector.getSchema = function(schemaCallback) {
    var cols = [
        {id: "bwEUBWID", dataType: tableau.dataTypeEnum.string},
        {id: "bwName", alias: "Name", dataType: tableau.dataTypeEnum.string},
        {id: "bwDistrict", alias: "District", dataType: tableau.dataTypeEnum.string},
        {id: "bwCountry", alias: "Country", dataType: tableau.dataTypeEnum.string},
        {id : "lat", alias : "latitude", dataType : tableau.dataTypeEnum.float },
        {id : "lon", alias : "longitude", dataType : tableau.dataTypeEnum.float },
        {id: "appointedSewerageUndertaker", alias: "WaterCompany", dataType: tableau.dataTypeEnum.string},
        {id: "bwrBWDAssessment", alias: "Classification", dataType: tableau.dataTypeEnum.string}
    ];

    var tableSchema = {
        id: "bathingWaterQualityFeed",
        alias: "Bathing Water Quality Data for EA Bathing Waters",
        columns: cols
    };

    schemaCallback([tableSchema]);
};

// Download the data
myConnector.getData = function(table, doneCallback) {
    $.getJSON("https://environment.data.gov.uk/doc/bathing-water.json?_view=bathing-water&_pageSize=1000&_page=0", function(resp) {
        var feat = resp.result.items,
            tableData = [];

        console.log(feat);

        // Iterate over the JSON object
        for (var i = 0, len = feat.length; i < len; i++) {
            var obj = feat[i];
            var newObject = {
                "bwEUBWID": obj.eubwidNotation,
                "bwName": obj.name._value,
                "bwDistrict": obj.district[0].name._value,
                "bwCountry": obj.country.name._value,
                "appointedSewerageUndertaker": obj.appointedSewerageUndertaker.name._value,
                "lat": obj.samplingPoint.lat,
                "lon": obj.samplingPoint.long
            };

            if(obj.hasOwnProperty("latestComplianceAssessment")) {
                newObject["bwrBWDAssessment"] = obj.latestComplianceAssessment.complianceClassification.name._value;
            } else  {
                newObject["bwrBWDAssessment"] = "Newly Designated";
            }
            tableData.push(newObject);
        }

        table.appendRows(tableData);
        doneCallback();
    });
};

tableau.registerConnector(myConnector);

// Create event listeners for when the user submits the form
$(document).ready(function() {
    $("#submitButton").click(function() {
        tableau.connectionName = "EA Bathing Water Quality Feed"; // This is the data source name in Tableau
        tableau.submit(); // This sends the connector object to Tableau
    });
});

})(); 
