import './App.css';
import { Routes, Route } from 'react-router-dom';
import Main from './Main';
import Error from './Error';
export default function App() {

    return (
        <div className="app">
            <Routes>
                <Route path='/' element={ <Error /> }></Route>
                <Route path='/:id' element={ <Main /> }></Route>
            </Routes>
        </div>
    )
}