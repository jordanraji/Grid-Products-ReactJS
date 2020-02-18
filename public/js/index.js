class Item extends React.Component {
    constructor(props) {
        super(props);

        this.priceHandler = this.priceHandler.bind(this);
    }
    render() {
        return (
            <div className="col-md-3 col-6 my-3">
                <div className="card card-body h-100">
                    <p className="text-center" style = {{ fontSize: this.props.product.size }}>{this.props.product.face}</p>
                    <h5 className="text-center">${ this.priceHandler(this.props.product.price) }</h5>
                    <p className="text-center"><small>{ this.dateHandler(this.props.product.date) }</small></p>
                </div>
            </div>
        );
    }

    priceHandler(cents) {
        return (cents/100.0).toFixed(2);
    }

    dateHandler(date) {
        const product_date = new Date(date);
        const current_date = new Date();
        const difference_time = Math.abs(current_date - product_date);
        const difference_days = Math.ceil(difference_time / (1000 * 60 * 60 * 24)); 
        if (difference_days < 7){
            return difference_days +" days ago"
        }
        return date.substr(0, 15);
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            products: [],
            orderBy: "id",
        };

        this.getProducts = this.getProducts.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    getProducts(page=1, limit=20, sort='id') {
        axios({
            url: 'http://localhost:3000/products',
            method: 'get',
            params: {
                "_page": page,
                "_limit": limit,
                "_sort": sort
            }
        }).then(response => {
            console.log(response);
            this.setState({
                products: response.data
            });
        })
    }

    handleChange(){
        this.setState({ orderBy: event.target.value });
        this.getProducts(undefined, undefined, event.target.value);
    }

    render() {
        return (
            <div>
                <nav className="navbar fixed-top navbar-light bg-light">
                    <div className="container">
                        <span className="navbar-brand">faces</span>
                        <form className="form-inline">
                            <label>
                                <span className="mr-2">Order by:</span> 
                                <select className="custom-select" onChange={this.handleChange}>
                                    <option value="id">ID</option>
                                    <option value="price">Price</option>
                                    <option value="size">Size</option>
                                </select>
                            </label>
                        </form>
                    </div>
                </nav>
                <div className="container">
                    <div className="row">
                        {this.state.products.map(function(product){
                            return <Item key={product.id} product={product}></Item>
                        })}
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount(){
        this.getProducts();
    }
}

// ========================================

ReactDOM.render(
    <App />, document.getElementById('app')
);
