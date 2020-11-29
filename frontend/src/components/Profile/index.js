import React, { Component, createRef } from 'react';
import { Loading } from '../Partials';
import { Pagination } from '@material-ui/lab';
import NewComment from "../../components/NewComment";

import "./styles.css"

const heartIcon = require("../../assets/heart.svg");
const deleteIcon = require("../../assets/delete.svg");
const editIcon = require("../../assets/edit.svg");
const gearsIcon = require("../../assets/gears.svg");

const states = [
    "Acre", "Alagoas", "Amapá",
    "Amazonas", "Bahia", "Ceará",
    "Distrito Federal", 
    "Espírito Santo", "Goiás",
    "Maranhão", "Mato Grosso", 
    "Mato Grosso do Sul", 
    "Minas Gerais", "Pará",
    "Paraíba", "Paraná",
    "Pernambuco", "Piauí",
    "Rio de Janeiro",
    "Rio Grande do Norte", 
    "Rio Grande do Sul", 
    "Rondônia", "Roraima",
    "Santa Catarina", 
    "São Paulo", "Sergipe",
    "Tocantins"
]

const beliefs = [
    "Ateu", "Cético", "Espírita",
    "Budista", "Candomblé", "Hare Krishna",
    "Islamismo", "Judaismo", "Catolicismo",
    "Anglicana", "Mórmon", "Ümbanda",
    "Testemunha de Jeová", "Satanismo",
    "Metodista", "Brasil para Cristo", 
    "Congregacional", "Batista",
    "Congregação Cristã no Brasil",
    "Universal do Reino de Deus",
    "Internacional da Graça de Deus",
    "Mundial do Poder de Deus",
    "Evangelho Quadrangular",
    "Adventista do Sétimo Dia",
    "Igreja Luterana", "Presbiteriana",
    "Assembleia de Deus", "Outra"
]

export default class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            perfilClass: "invisible",
            editBox: "invisible",
            blur: "none",
            perfilDisplay: "contents",
            configDisplay: "none",
            buttonDisplay: "block",

            email: "", name: "",
            belief: "", state: "",

            total_comments: 0,
            total_books: 0,
            total_chapters: 0,
            commentaries: [],
            favorites: [],

            currentFPage: 1,
            currentCPage: 1,
            totalFpages: 0,
            totalCpages: 0
        }

        this.editComponent = createRef();
        this.closeEditComment = this.closeEditComment.bind(this);
    }
    
    handleFPaginate(page) { this.setState({ currentFPage: page }) }
    handleCPaginate(page) { this.setState({ currentCPage: page }) }
    calculatePagination(type) {
        let page = 0;
        let array = [];
        if (type === "favorites") {
            page = this.state.currentFPage;
            array = this.state.favorites;
        } else {
            page = this.state.currentCPage;
            array = this.state.commentaries;
        }
        var inicio = (page - 1) * 5;
        var final = inicio + 5;

        return array.slice(inicio, final);
    }

    editComment(identificador) {
        let selected = "";
        this.state.commentaries.forEach(element => {
            if (element.id === identificador) {
                selected = element.text;
            }
        })
        this.editComponent.current.setState({
            texto: selected,
            comment_id: identificador
        })

        this.setState({
            blur: "block",
            editBox: "visible centro"
        });
    }
    closeEditComment(evt) {
        evt.preventDefault();
        this.setState({ blur: "none", editBox: "invisible" });
    }

    deleteComment(identificador) {
        if (window.confirm("Tem certeza que quer deletar este comentário?")) {
            this.setState({
                commentaries: this.state.commentaries.filter(
                    (item) => {return item.id !== identificador})
            })
            this.props.deleteComment(identificador);
        }
    }

    closeAccount() {
        this.setState({ perfilClass: "invisible" })
        this.props.closeAccount();
    }

    handleConfig() { 
        if (this.state.perfilDisplay === "contents") {
            this.setState({ 
                perfilDisplay: "none",
                buttonDisplay: "none",
                configDisplay: "flex"
            })
        } else {
            this.setState({ 
                perfilDisplay: "contents",
                buttonDisplay: "block",
                configDisplay: "none"
            })
        }
    }

    handleSelect(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render() { return (
        <>
        <section className={this.state.perfilClass}>
            <h2> 
                Adorador {this.state.name} 
                <button onClick = {() => {this.handleConfig()}}> 
                    <img src={gearsIcon} alt="config"/> 
                </button>
            </h2>
            <ul style = {{ display: this.state.perfilDisplay }}>
                <li>
                    Total de livros comentados: {this.state.total_books} de 66
                </li>
                <li>
                    Total de capítulos comentados: {this.state.total_chapters} de 1.189
                </li>
                <li>
                    Total de comentários feitos: {this.state.total_comments}
                </li>

                <ul className="commentaries">
                    <h3> Comentários feitos </h3>
                    {(this.state.commentaries.length !== 0) ? 
                    this.calculatePagination("comments").map(commentary => (
                        <li key = {"0" + commentary.id}>
                            <label 
                                style = {{ display: "flex" }}
                                htmlFor={"0" + commentary.id}> 
                                <p>
                                    {commentary.text}
                                </p> 
                            </label>
                            <input type="checkbox" id={"0" + commentary.id}/>
                            <div className = "user-comment">
                                {commentary.text}
                                <p>
                                    <button onClick={
                                        () => {this.editComment(commentary.id)}}>
                                        <img src={editIcon} alt="Edit"/>
                                    </button> 
                                    <b>
                                        {JSON.parse(commentary.likes).length}
                                        <img src={heartIcon} alt="Heart"/>
                                    </b> 
                                    <button onClick={
                                        () => {this.deleteComment(commentary.id)}}>
                                        <img src={deleteIcon} alt="Delete"/>
                                    </button> 
                                </p>
                            </div>
                        </li>
                    )) : (this.state.totalCpages !== -1) ? 
                    <li>
                        <p> Nenhum comentário realizado </p>
                    </li> :
                    <Loading />}
                    <Pagination 
                        className = "pagination" showFirstButton showLastButton
                        count = {this.state.totalCpages} size = "small"
                        page = {this.state.currentCPage} shape="rounded"
                        onChange = {(evt, page) => {this.handleCPaginate(page)}}
                    />
                </ul>

                <ul className="commentaries">
                    <h3> Comentários favoritados </h3>
                    {(this.state.favorites.length !== 0) ? 
                    this.calculatePagination("favorites").map((favorite, index) => (
                        <li key = {"-" + index}>
                            <h5 style={{ display: "inline" }} >
                                {favorite.name} em {favorite.book_reference}
                            </h5>
                            <label 
                                style = {{ display: "flex" }}
                                htmlFor={"-" + index}> 
                                <p>
                                    {favorite.text}
                                </p> 
                            </label>
                            <input type="checkbox" id={"-" + index}/>
                            <div className = "user-comment">
                                {favorite.text}
                            </div>
                        </li>
                    )) : (this.state.totalFpages !== -1) ? 
                    <li>
                        <p> Você não favoritou nenhum comentário </p>
                    </li> :
                    <Loading />}
                    <Pagination 
                        className = "pagination" showFirstButton showLastButton
                        count = {this.state.totalFpages} size = "small" 
                        page = {this.state.currentFPage} shape="rounded"
                        onChange = {(evt, page) => {this.handleFPaginate(page)}}
                    />
                </ul>
            </ul>
            <div style={{ display: this.state.configDisplay }}
                className = "user-config">
                <div className="dropdown-menu">
                    <label htmlFor="state"> Estado: </label>
                    <select name="state" id="state" value = {this.state.state}
                        onChange = {(evt) => this.handleSelect(evt)}>
                        {states.map(item => (
                            <option 
                                value={item}
                                key = {item}
                            > {item} </option>
                        ))}
                    </select>
                </div>
                <div className="dropdown-menu">
                    <label htmlFor="belief"> Crença: </label>
                    <select name="belief" id="belief" value = {this.state.belief}
                        onChange = {(evt) => this.handleSelect(evt)}>
                        {beliefs.map(item => (
                            <option 
                                value={item}
                                key = {item}
                            > {item} </option>
                        ))}
                    </select> 
                </div>
                <div className="config-buttons">
                    <button style={{ backgroundColor: "#1D1"}}
                        onClick = {() => this.props.updateAccount(
                            this.state.belief, this.state.state
                        )}> 
                        Salvar 
                    </button>
                    <button style={{ backgroundColor: "#FF4030"}}
                        onClick = {() => this.props.deleteAccount(
                            this.state.email
                        )}>
                        Excluir conta 
                    </button>
                </div>
            </div>
            <button style={{ display: this.state.buttonDisplay }}
                onClick = {() => {this.closeAccount()}} > 
                Sair 
            </button>
        </section>

        <div className={this.state.editBox}>
            <NewComment 
                ref = {this.editComponent}
                title = "Editar comentário"
                post = {false}
                on_title = {false}
                close = {this.closeEditComment}
                notification = {this.props.notification}
                text = {this.state.selected}
            />
        </div>
        <div className="overlay" style={
            { display: this.state.blur }
        }></div>
        </>
    )}
}