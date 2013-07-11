'use strict'

// The app
var app = angular.module('funding', ['funding.services', 'funding.controllers', 'funding.filters', 'funding.directives']);

// The services
var services = angular.module('funding.services', []);

services.service('FTClient', [function() {
    return new FTClient('AIzaSyCQRQld86JPSoZPcbN6NaRLxSqzEPf1e7c');
}])

services.service('Filter', ['FTClient', function(FTClient) {
    return {
        beneficiarios: [],
        tipos_de_proyecto: [],
        tipos_de_convocatoria: []
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

// The directives
var directives = angular.module('funding.directives', []);

// Stops propagation f the click event
directives.directive('stopClick', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
            event.stopPropagation();
        });
    }
})

directives.directive('preventClick', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
            event.preventDefault();
        });
    }
})

// The controllers
var controllers = angular.module('funding.controllers', ['funding.services']);

// Result Controller
controllers.controller('AppController', ['$scope', 'Filter', 'FTClient', function($scope, Filter, FTClient) {
    $scope.filter = Filter;
    $scope.debug = false;

    // Beneficiarios
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

    // Tipo de proyecto
    $scope.toggleTipoDeProyectoChecked = function(tipo) {
        tipo.checked = !tipo.checked;
        Filter.tipos_de_proyecto = $scope.tipos_de_proyecto.filter(function(item) { return item.checked; })
        $scope.facet();
    }

    $scope.resetTipoDeProyecto = function() {
        Filter.tipos_de_proyecto = [];
        $scope.tipos_de_proyecto.map(function(item) { item.checked = false; })
        $scope.facet();
    }

    // Tipo de convocatoria
    $scope.toggleTipoDeConvocatoriaChecked = function(tipo) {
        tipo.checked = !tipo.checked;
        Filter.tipos_de_convocatoria = $scope.tipos_de_convocatoria.filter(function(item) { return item.checked; })
        $scope.facet();
    }

    $scope.resetTipoDeConvocatoria = function() {
        Filter.tipos_de_convocatoria = [];
        $scope.tipos_de_convocatoria.map(function(item) { item.checked = false; })
        $scope.facet();
    }

    $scope.resetFilter = function() {
        Filter.beneficiarios = [];
        $scope.beneficiarios.map(function(item) { item.checked = false; })
        Filter.tipos_de_proyecto = [];
        $scope.tipos_de_proyecto.map(function(item) { item.checked = false; })
        Filter.tipos_de_convocatoria = [];
        $scope.tipos_de_convocatoria.map(function(item) { item.checked = false; })
        $scope.facet();
    }

    $scope.facet = function() {
        var beneficiarios = {};
        Filter.beneficiarios.map(function(item) { beneficiarios[item.label] = 1; })
        var tipos_de_proyecto = {};
        Filter.tipos_de_proyecto.map(function(item) { tipos_de_proyecto[item.label] = 1; })
        var tipos_de_convocatoria = {};
        Filter.tipos_de_convocatoria.map(function(item) { tipos_de_convocatoria[item.label] = 1; })

        $scope.funds = $scope.results.filter(function(fund) {
            var retain = true;
            
            if (Filter.beneficiarios.length > 0) {
                var matches = false;
                for (var i=0; i<Filter.beneficiarios.length; i++) {
                    var parts = fund.beneficiarios.split(", ");
                    for (var j=0; j < parts.length; j++) {
                        if (parts[j] == Filter.beneficiarios[i].label) {
                            matches = true;
                            break;
                        }
                    }
                }
                retain = retain && matches;
            }

            if (Filter.tipos_de_proyecto.length > 0) {
                var matches = false;
                for (var i=0; i<Filter.tipos_de_proyecto.length; i++) {
                    var parts = fund.tipo_de_proyecto.split(", ");
                    for (var j=0; j < parts.length; j++) {
                        if (parts[j] == Filter.tipos_de_proyecto[i].label) {
                            matches = true;
                            break;
                        }
                    }
                }
                retain = retain && matches;
            }

            if (Filter.tipos_de_convocatoria.length > 0) {
                var matches = false;
                for (var i=0; i<Filter.tipos_de_convocatoria.length; i++) {
                    var parts = fund.tipo_de_convocatoria.split(", ");
                    for (var j=0; j < parts.length; j++) {
                        if (parts[j] == Filter.tipos_de_convocatoria[i].label) {
                            matches = true;
                            break;
                        }
                    }
                }
                retain = retain && matches;
            }
            
            return retain;
        })
    }

    // Beneficiarios
    FTClient.query({
        fields: ['beneficiarios'],
        table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8',
        tail: 'GROUP BY beneficiarios'
    }, function(rows) {
        var beneficiarios = []
        rows.map(function(row) {
            if (row[0] != null) {
                var parts = row[0].split(", ");
                for (var i=0; i<parts.length; i++) {
                    var exists = beneficiarios.filter(function(beneficiario) { return beneficiario.label == parts[i] }).length > 0;
                    if (!exists) {
                        beneficiarios.push({
                            label: parts[i],
                            checked: false
                        })
                    }
                }
            }
        })
        $scope.beneficiarios = beneficiarios;
        $scope.$apply();
    })

    // Tipo de proyecto
    FTClient.query({
        fields: ['tipo_de_proyecto'],
        table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8',
        tail: 'GROUP BY tipo_de_proyecto'
    }, function(rows) {
        var tipo_de_proyectos = []
        rows.map(function(row) {
            if (row[0] != "") {
                tipo_de_proyectos.push({
                    label: row[0]
                })
            }
        })
        $scope.tipos_de_proyecto = tipo_de_proyectos;
        $scope.$apply();
    })

    // Tipo de convocatoria
    FTClient.query({
        fields: ['tipo_de_convocatoria'],
        table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8',
        tail: 'GROUP BY tipo_de_convocatoria'
    }, function(rows) {
        var tipo_de_convocatoria = []
        rows.map(function(row) {
            if (row[0] != "") {
                tipo_de_convocatoria.push({
                    label: row[0]
                })
            }
        })
        $scope.tipos_de_convocatoria = tipo_de_convocatoria;
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
                    mecanismos: row[11],
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
                    instrumento: row[17],
                    area: row[18],
                    etapa: row[19]
                })
            })

            $scope.funds = funds;
            $scope.results = funds;
            $scope.$apply();
        })
    }

    // init
    $scope.fetch();
}])