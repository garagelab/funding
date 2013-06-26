$(function() {
    var app = new App();
    app.init();
})

var App = function App() {

    this.ftClient;
    this.items = [];
    this.allProvinces = [
        'Buenos Aires', 'Capital Federal', 'Catamarca', 'Chaco', 'Corrientes', 'Chubut', 'Córdoba', 'Entre Ríos',
        'Formosa', 'Jujuy', 'La Rioja', 'La Pampa', 'Misiones', 'Mendoza', 'Neuquén', 'Río Negro', 'San Juan',
        'San Luis', 'Santa Fe', 'Salta', 'Santiago del Estero', 'Santa Cruz', 'Tierra del Fuego', 'Tucumán']

    this.init = function() {
        var self = this;

        self.ftClient = new FTClient('1eb4iyrFgENme011jHDwM44P1KWUwxRfKrPAC5V8');

        self.ftClient.query({
            select: [
                "fondo",
                "provincias_de_aplicacion",
                "beneficiarios",
                "mecanismos",
                "sector",
                "fase_de_desarrollo",
                "tipo_de_proyecto",
                "ins_etapas",
                "ins_areas",
                "tipo_de_convocatoria",
                "beneficiarios_descripcion",
                "beneficiarios_tipo",
                "objetivos",
                "tipo_de_financiamiento",
                "monto_maximo",
                "cobertura_maxima",
                "plazo_max",
                "detalle"
            ]
        }, function(data) {
            data.rows.map(self.addItem, self);

            var nonEmptyString = function(str) {
                return ;
            };

            var item_template =
                '<div class="item">' +
                    '<h3><%= fondo %></h3>' +
                    '<p><strong>Detalle: </strong><%= (detalle == "" || detalle == null) ? "-" : detalle %></p>' +
                    '<p><strong>Sector: </strong><%= (sector == "" || sector == null) ? "-" : sector %></p>' +
                    '<p><strong>Fase de desarrollo: </strong><%= (fase_de_desarrollo == "" || fase_de_desarrollo == null) ? "-" : fase_de_desarrollo %></p>' +
                    '<p><strong>Tipo de proyecto: </strong><%= (tipo_de_proyecto == "" || tipo_de_proyecto == null) ? "-" : tipo_de_proyecto %></p>' +
                    '<p><strong>Tipo de convocatoria: </strong><%= (tipo_de_convocatoria == "" || tipo_de_convocatoria == null) ? "-" : tipo_de_convocatoria %></p>' +
                    '<p><strong>Descripción de beneficiarios: </strong><%= (beneficiarios_descripcion == "" || beneficiarios_descripcion == null) ? "-" : beneficiarios_descripcion %></p>' +
                    '<p><strong>Tipo de beneficiarios: </strong><%= (beneficiarios_tipo == "" || beneficiarios_tipo == null) ? "-" : beneficiarios_tipo %></p>' +
                    '<p><strong>Objetivos: </strong><%= (objetivos == "" || objetivos == null) ? "-" : objetivos %></p>' +
                    '<p><strong>Tipo de financiamiento: </strong><%= (tipo_de_financiamiento == "" || tipo_de_financiamiento == null) ? "-" : tipo_de_financiamiento %></p>' +
                    '<p><strong>Monto máximo: </strong><%= (monto_maximo == "" || monto_maximo == null) ? "-" : "$" + monto_maximo %></p>' +
                    '<p><strong>Cobertura máxima: </strong><%= (cobertura_maxima == "" || cobertura_maxima == null) ? "-" : cobertura_maxima %></p>' +
                    '<p><strong>Plazo máximo: </strong><%= (plazo_max == "" || plazo_max == null) ? "-" : plazo_max %></p>' +
                    '<hr/>' +
                    '</div>';

            $('#facets').bind("facetuicreated", function() {
                // Empresas
                var empFacets = $("<div class='floatingFacet' id='empresasFacets'><a href='#' class='closeFloatingFacet'>&times;</a></div>");
                empFacets.appendTo(this);
                var empFacetLink = $("<div class='extrafacetlink'><a href='#'>Empresas</a></div>");
                empFacetLink.click(function() {
                    $('.floatingFacet[id!=empresasFacets]').hide();
                    empFacets.toggle();
                });
                empFacetLink.insertAfter("#mecanismos");
                $('#sector').appendTo(empFacets);
                $('#fase_de_desarrollo').appendTo(empFacets);
                $('#tipo_de_proyecto').appendTo(empFacets);

                // Instituciones
                var insFacets = $("<div class='floatingFacet' id='institucionesFacets'><a href='#' class='closeFloatingFacet'>&times;</a></div>");
                insFacets.appendTo(this);
                var insFacetLink = $("<div class='extrafacetlink'><a href='#'>Instituciones</a></div>");
                insFacetLink.click(function() {
                    $('.floatingFacet[id!=institucionesFacets]').hide();
                    insFacets.toggle();
                });
                insFacetLink.insertAfter(".extrafacetlink");
                $('#ins_etapas').appendTo(insFacets);
                $('#ins_areas').appendTo(insFacets);

                $('.closeFloatingFacet').click(function() { $(this).closest('.floatingFacet').toggle(); })

                $(this).animate({opacity: 1});
            });

            $.facetelize({
                items            : self.items,
                facets           : {
//                    'provincias' : 'Provincias',
                    'beneficiarios' : 'Beneficiarios',
                    'mecanismos' : 'Mecanismos',

                    // Empresas
                    'sector' : 'Sector',
                    'fase_de_desarrollo' : 'Fase de desarrollo',
                    'tipo_de_proyecto' : 'Tipo de proyecto',

                    // Instituciones
                    'ins_etapas' : 'Etapas',
                    'ins_areas' : 'Áreas'
                },
                resultSelector   : '#results',
                facetSelector    : '#facets',
                resultTemplate   : item_template,
                paginationCount  : 10,
                orderByTemplate  : '',
                facetContainer   : '<div class="facetsearch span4" id=<%= id %> ></div>',
                countTemplate    : '<div class=facettotalcount><%= count %> resultados</div>',
                deselectTemplate : '<div class=deselectstartover>Limpiar filtro</div>',
                showMoreTemplate : '<a id=showmorebutton>Más resultados</a>',
                noResults        : '<div class=results>No hay ningún resultado para esta búsqueda</div>'
            });



        })
    };

    this.addItem = function(row) {
        var self = this;
        this.items.push({
            'fondo': row[0],
            'provincias': row[1].trim().indexOf('Todo el país') == 0 ? self.allProvinces : row[1].trim().split(', '),
            'beneficiarios': row[2].split(', '),
            'mecanismos': row[3].split(', '),
            'sector': row[4],
            'fase_de_desarrollo': row[5],
            'tipo_de_proyecto': row[6],
            'emp_etapas': row[7].split(', '),
            'ins_etapas': row[8].split(', '),
            'emp_areas': row[9].split(', '),
            'ins_areas': row[10].split(', '),
            'tipo_de_convocatoria': row[11],
            'beneficiarios_descripcion': row[12],
            'beneficiarios_tipo': row[13],
            'objetivos': row[14],
            'tipo_de_financiamiento': row[15],
            'monto_maximo': row[16],
            'cobertura_maxima': row[17],
            'plazo_max': row[18],
            'detalle': row[19]
        });
    }
}