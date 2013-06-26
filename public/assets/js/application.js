'use strict'

// The app
var app = angular.module('funding', ['funding.services', 'funding.controllers']);

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

// The controllers
var controllers = angular.module('funding.controllers', ['funding.services']);

// Result Controller
controllers.controller('AppController', ['$scope', 'Filter', 'FTClient', function($scope, Filter, FTClient) {
    $scope.filter = Filter;

    $scope.toggleBeneficiarioChecked = function(beneficiario) {
        beneficiario.checked = !beneficiario.checked;

        Filter.beneficiarios = $scope.beneficiarios.filter(function(item) {
            return item.checked;
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
        fields: ['mecanismos'],
        table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8',
        tail: 'GROUP BY mecanismos'
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

    $scope.query = function() {
        FTClient.query({
            fields: ['*'],
            table: '1QqoOKkOXGNBcaVrkcb0l93VseJKtjeoMqwqg-x8'
        }, function(rows) {
            var funds = [];
            rows.map(function(row) {
                funds.push({
                    fondo: row[0],
                    beneficiarios: row[2],
                    mecanismos: row[3],
                    sector: row[4],
                    fase_de_desarrollo: row[5],
                    tipo_de_proyecto: row[6],
                    ins_etapas: row[7],
                    ins_areas: row[8],
                    tipo_de_convocatoria: row[9],
                    beneficiarios_descripcion: row[10],
                    beneficiarios_tipo: row[11],
                    objetivos: row[12],
                    tipo_de_financiamiento: row[13],
                    monto_maximo: row[14],
                    cobertura_maxima: row[15],
                    plazo_max: row[16],
                    detalle: row[17],
                    url: row[18],
                    instrumento: row[19]
                })
            })

            $scope.funds = funds;
            $scope.$apply();
        })
    }

    // init
    $scope.query();
}])