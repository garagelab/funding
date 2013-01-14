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

        self.ftClient = new FTClient('1vAIR_rP8fzPs_EYiaKEgXSq8yNa2Z1yV12SnOXI');

        self.ftClient.query({
            select: ['provincias-en-las-que-actualmente-se-aplica-el-instrumento', 'beneficiarios', 'mecanismos',
                'tema', 'titulo', 'detalle-y-cantidad-de-beneficiarios', 'objetivos', 'beneficios', 'monto', 'web',
                'area', 'organismo', 'telefono', 'fecha-de-inicio', 'fecha-de-cierre']
        }, function(data) {
            data.rows.map(self.addItem, self);
            var item_template =
                '<div class="item">' +
                    '<h3><%= obj.title %></h3>' +
                    '<p><strong>Detalle: </strong><%= obj.details %></p>' +
                    '<p><strong>Objetivos: </strong><%= obj.objectives %></p>' +
                    '<p><strong>Beneficios: </strong><%= obj.benefits %></p>' +
                    '<p><strong>Monto: </strong><%= obj.amount %></p>' +
                    '<% if (obj.startDate || obj.endDate) { %>' +
                    '<p><strong>Fechas: </strong>' +
                    '<% if (obj.startDate) { %>desde el <%= obj.startDate %> <% } %><% if (obj.endDate) { %>desde el <%= obj.endDate %> <% } %>' +
                    '</p><% } %>' +
                    '<p><strong>Web: </strong><a href="<%= obj.web %>" target="_blank"><%= obj.web %></a></p>' +
                    '<p><strong>Contactos: </strong>' +
                    '<%= obj.phone %> ' +
                    '<% if (obj.area != "Indefinido" && obj.area != "OTRA Secretaría") { %> / <%= obj.area %> <% } %>' +
                    '<% if (obj.entity != "OTRO Ministerio") { %> / <%= obj.entity %> <% } %></p>' +
                    '<hr/>' +
                    '</div>';

            $.facetelize({
                items            : self.items,
                facets           : {
                    'provinces' : 'Provincias',
                    'beneficiaries' : 'Beneficiarios',
                    'mecanisms' : 'Mecanismos',
                    'topics' : 'Temas',
                    'entity' : 'Organismos'
                },
                resultSelector   : '#results',
                facetSelector    : '#facets',
                resultTemplate   : item_template,
                paginationCount  : 10,
                orderByTemplate  : '',
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
            'provinces' : row[0].trim().indexOf('Todo') == 0 ? self.allProvinces : row[0].trim().split(', '),    //TODO(gb): Fix this
            'beneficiaries' : row[1].split(', '),
            'mecanisms' : row[2].split(', '),
            'topics' : row[3].split(', '),
            'title' : row[4],
            'details' : row[5],
            'objectives' : row[6],
            'benefits' : row[7],
            'amount' : row[8],
            'web' : row[9],
            'area' : row[10],
            'entity' : row[11],
            'phone' : row[12],
            'startDate' : row[13],
            'endDate' : row[14].substr(0,10)
        });
    }
}