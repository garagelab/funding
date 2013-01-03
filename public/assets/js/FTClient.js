var FTClient = function FTClient(tableId) {

    this.tableId = tableId;

    this._queryUrlHead = 'https://fusiontables.googleusercontent.com/fusiontables/api/query?sql=';
    this._queryUrlTail = '&jsonCallback=?';

    this.query = function(queryObject, success, error) {
        var self = this;

        error = error || function() { throw "AJAX error!"; }

        $.ajax({
            type: "GET",
            url:  self.getQueryUrl(queryObject),
            dataType: "jsonp",
            success: success,
            error: error
        });
    }

    this.getQueryUrl = function(queryObject) {
        var self = this;
        var query = "";

        if (queryObject.select) {
            query += "SELECT '" + queryObject.select.join("','") + "' FROM " + self.tableId;
        }

        if (queryObject.where) {
            query += " WHERE " + queryObject.where;
        }

        if (queryObject.orderBy) {
            query += " ORDER BY " + queryObject.orderBy;
        }

        if (queryObject.offset != null && queryObject.offset != undefined) {
            query += " OFFSET " + queryObject.offset;
        }

        if (queryObject.limit) {
            query += " LIMIT " + queryObject.limit;
        }

        return encodeURI(self._queryUrlHead + query + self._queryUrlTail);
    }
}