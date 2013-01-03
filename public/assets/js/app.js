$(function() {
    console.log('init');        //TODO(gb): Remove trace!!!
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
            select: ['provincias-en-las-que-actualmente-se-aplica-el-instrumento', 'beneficiarios', 'mecanismos', 'tema', 'titulo'],
            limit: 20
        }, function(data) {
            data.table.rows.map(self.addItem, self);
            var item_template =
                '<div class="item">' +
                    '<h4><%= obj.title %></h4>' +
                    '</div>';

            $.facetelize({
                items            : self.items,
                facets           : {
                    'provinces' : 'Provincias',
                    'beneficiaries' : 'Beneficiarios',
                    'mecanisms' : 'Mecanismo',
                    'topics' : 'Tema'
                },
                resultSelector   : '#results',
                facetSelector    : '#facets',
                resultTemplate   : item_template,
                paginationCount  : 50
//                orderByOptions   : {'firstname': 'First name', 'lastname': 'Last name', 'category': 'Category', 'RANDOM': 'Random'},
//                facetSortOption  : {'continent': ["North America", "South America"]}
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
            'title' : row[4]
        });
    }
}