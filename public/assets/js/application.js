'use strict'

// The app
var app = angular.module('funding', ['funding.services', 'funding.controllers', 'funding.filters']);

// The services
var services = angular.module('funding.services', []);

services.service('FTClient', [function() {
    return new FTClient('AIzaSyCQRQld86JPSoZPcbN6NaRLxSqzEPf1e7c');
}])

services.service('Filter', ['FTClient', function(FTClient) {
    return {
        beneficiarios: [],
        mecanismos: []
    }
}])

// The filters
var filters = angular.module('funding.filters', []);

filters.filter('nonempty', [function() {
    return function(str) {
        return str == "" ? "-" : str;
    }
}])

filters.filter('join', [function() {
    return function(arr, prop, sep) {
        return arr.map(function(elem) { return elem[prop] }).join(sep);
    }
}])

// The controllers
var controllers = angular.module('funding.controllers', ['funding.services']);

// Result Controller
controllers.controller('AppController', ['$scope', 'Filter', 'FTClient', function($scope, Filter, FTClient) {
    $scope.filter = Filter;
    $scope.debug = false;

    $scope.toggleBeneficiarioChecked = function(beneficiario) {
        beneficiario.checked = !beneficiario.checked;
        Filter.beneficiarios = $scope.beneficiarios.filter(function(item) { return item.checked; })
        $scope.facet();
    }

    $scope.resetBeneficiarios = function() {
        Filter.beneficiarios = [];
        $scope.beneficiarios.map(function(item) { item.checked = false; })
        $scope.facet();
    }

    $scope.resetMecanismos = function() {
        Filter.mecanismos = [];
        $scope.mecanismos.map(function(item) { item.checked = false; })
        $scope.facet();
    }

    $scope.resetFilter = function() {
        Filter.beneficiarios = [];
        $scope.beneficiarios.map(function(item) { item.checked = false; })
        Filter.mecanismos = [];
        $scope.mecanismos.map(function(item) { item.checked = false; })
        $scope.facet();
    }

    $scope.toggleMecanismoChecked = function(mecanismo) {
        mecanismo.checked = !mecanismo.checked;
        Filter.mecanismos = $scope.mecanismos.filter(function(item) { return item.checked; })
        $scope.facet();
    }

    $scope.facet = function() {
        var beneficiarios = {};
        Filter.beneficiarios.map(function(item) { beneficiarios[item.label] = 1; })
        var mecanismos = {};
        Filter.mecanismos.map(function(item) { mecanismos[item.label] = 1; })

        $scope.funds = $scope.results.filter(function(fund) {
            var retain = true;
            if (Filter.beneficiarios.length > 0) {
                retain = retain && fund.beneficiarios in beneficiarios;
            }
            if (Filter.mecanismos.length > 0) {
                retain = retain && fund.mecanismos in mecanismos;
            }
            return retain;
        })
    }

    // Beneficiarios
    FTClient.query({
        fields: ['beneficiarios', 'COUNT()'],
        table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8',
        tail: 'GROUP BY beneficiarios ORDER BY COUNT() DESC'
    }, function(rows) {
        var beneficiarios = []
        rows.map(function(row) {
            if (row[0] != null) {
                beneficiarios.push({
                    label: row[0],
                    checked: false
                })
            }
        })
        $scope.beneficiarios = beneficiarios;
        $scope.$apply();
    })

    // Mecanismos
    FTClient.query({
        fields: ['mecanismos', 'COUNT()'],
        table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8',
        tail: 'GROUP BY mecanismos ORDER BY COUNT() DESC'
    }, function(rows) {
        var mecanismos = []
        rows.map(function(row) {
            if (row[0] != "") {
                mecanismos.push({
                    label: row[0]
                })
            }
        })
        $scope.mecanismos = mecanismos;
        $scope.$apply();
    })

    $scope.fetch = function() {
        FTClient.query({
            fields: ['*'],
            table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8'
        }, function(rows) {
            var funds = [];
            rows.map(function(row) {
                funds.push({
                    fondo: row[0],
                    provincias_de_aplicacion: row[1],
                    beneficiarios: row[2],
                    mecanismos: row[3],
                    sector: row[4],
                    fase_de_desarrollo: row[5],
                    tipo_de_proyecto: row[6],
                    tipo_de_convocatoria: row[7],
                    beneficiarios_descripcion: row[8],
                    beneficiarios_tipo: row[9],
                    objetivos: row[10],
                    tipo_de_financiamiento: row[11],
                    monto_maximo: row[12],
                    cobertura_maxima: row[13],
                    plazo_max: row[14],
                    detalle: row[15] == "" ? null : row[15],
                    url: row[16],
                    instrumento: row[17]
                })
            })

            $scope.funds = funds;
            $scope.results = funds;
            console.log(funds);        //TODO(gb): Remove trace!!!
            $scope.$apply();
        })
    }

    // init
    $scope.fetch();
}])