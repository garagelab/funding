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
        mecanismos: [],
        empresas: {
            sector: [],
            fase_de_desarrollo: [],
            tipo_de_proyecto: []
        }
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
        Filter.empresas['sector'] = [];
        $scope.empresas['sector'].map(function(item) { item.checked = false; })
        Filter.empresas['fase_de_desarrollo'] = [];
        $scope.empresas['fase_de_desarrollo'].map(function(item) { item.checked = false; })
        Filter.empresas['tipo_de_proyecto'] = [];
        $scope.empresas['tipo_de_proyecto'].map(function(item) { item.checked = false; })
        $scope.facet();
    }

    $scope.toggleMecanismoChecked = function(mecanismo) {
        mecanismo.checked = !mecanismo.checked;
        Filter.mecanismos = $scope.mecanismos.filter(function(item) { return item.checked; })
        $scope.facet();
    }

    $scope.empresas = {
        sector: [],
        fase_de_desarrollo: [
            { label: 'Startup', checked: false },
            { label: 'Crecimiento', checked: false },
            { label: 'Consolidación', checked: false }
        ],
        tipo_de_proyecto: [
            { label: 'Modernización' },
            { label: 'Innovación' },
            { label: 'Generación de capacidades de I+D' },
            { label: 'Generación de capacidades para prestar servicios' },
            { label: 'Asociatividad' },
            { label: 'Formación de RRHH' }
        ]
    }

    $scope.toggleEmpresasChecked = function(item, prop) {
        item.checked = !item.checked;
        Filter.empresas[prop] = $scope.empresas[prop].filter(function(item) { return item.checked; })
        $scope.facet();
    }

    $scope.resetEmpresas = function(prop) {
        Filter.empresas[prop] = [];
        $scope.empresas[prop].map(function(item) { item.checked = false; })
        $scope.facet();
    }

    $scope.facet = function() {
        var beneficiarios = {};
        Filter.beneficiarios.map(function(item) { beneficiarios[item.label] = 1; })
        var mecanismos = {};
        Filter.mecanismos.map(function(item) { mecanismos[item.label] = 1; })

        var empresas = null;
        if ($scope.advanced == "empresas") {
            empresas = {};
            empresas['fase_de_desarrollo'] = {};
            Filter.empresas.fase_de_desarrollo.map(function(item) {
                empresas['fase_de_desarrollo'][item.label] = 1
            })
            empresas['tipo_de_proyecto'] = {};
            Filter.empresas.tipo_de_proyecto.map(function(item) {
                empresas['tipo_de_proyecto'][item.label] = 1
            })
            empresas['sector'] = {};
            Filter.empresas.sector.map(function(item) {
                empresas['sector'][item.label] = 1
            })
        }

        $scope.funds = $scope.results.filter(function(fund) {
            var retain = true;
            if (Filter.beneficiarios.length > 0) {
                retain = retain && fund.beneficiarios in beneficiarios;
            }
            if (Filter.mecanismos.length > 0) {
                retain = retain && fund.mecanismos in mecanismos;
            }

            // Empresas
            if ($scope.advanced == "empresas") {
                if (Filter.empresas.fase_de_desarrollo.length > 0) {
                    retain = retain && fund.fase_de_desarrollo in empresas.fase_de_desarrollo;
                }
                if (Filter.empresas.tipo_de_proyecto.length > 0) {
                    retain = retain && fund.tipo_de_proyecto in empresas.tipo_de_proyecto;
                }
                if (Filter.empresas.sector.length > 0) {
                    retain = retain && fund.sector in empresas.sector;
                }
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
        fields: ['tipo_de_financiamiento', 'COUNT()'],
        table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8',
        tail: 'GROUP BY tipo_de_financiamiento ORDER BY COUNT() DESC'
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

    // Sector
    FTClient.query({
        fields: ['sector', 'COUNT()'],
        table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8',
        tail: 'GROUP BY sector ORDER BY COUNT() DESC'
    }, function(rows) {
        var sectores = []
        rows.map(function(row) {
            if (row[0] != "") {
                sectores.push({
                    label: row[0]
                })
            }
        })
        $scope.empresas.sector = sectores;
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
                    instrumento: row[17]
                })
            })

            $scope.funds = funds;
            $scope.results = funds;
            $scope.$apply();
        })
    }

    $scope.advanced = null;
    $scope.setAdvanced = function(id) {

        if (id == $scope.advanced) {
            return;
        }

        if (!id) {
            $("#instituciones").collapse('hide');
            $("#empresas").collapse('hide');
        }

        if ($scope.advanced && id == "empresas") {
            $("#instituciones").collapse('hide');

        }

        if ($scope.advanced && id == "instituciones") {
            $("#empresas").collapse('hide');
        }

        $scope.advanced = id;
        $scope.facet();
    }

    // init
    $scope.fetch();
}])