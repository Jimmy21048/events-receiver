import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './App.css';

export default function Main() {
    const history = useNavigate();
    const {id} = useParams();
    const [data, setData] = useState([]);
    const today = new Date().setHours(0, 0, 0, 0);

    if(!id) {
        history('/');
    }
    useEffect(() => {
        if(id) {
            axios.post('http://localhost:3002/sent', { id }, {
                headers : {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if(response.data.error ||
                response.data.userError ||
                response.data.validationError ||
                response.data.tokenError) {
                    history('/');
                } else if(response.data.message) {
                    setData(response.data.message[0]);
                    console.log(new Date(data.open_date).getTime(), today);
                    console.log(new Date(data.open_date).getTime() > today)
                }
            })
        } else {
            history('/');
        }
    })
    
    return (
        <>
            {
                today <= new Date(data.open_date).getTime() ? 
                <div className="main-page">
            
                <div className="main-page-left">
                    <div className="event-info">
                        <h1>HAPPY <br/> { data.event_type }</h1>
                        <h4>{ data.r_name }</h4>
                    </div>
                    <div className="img-feedback">
                        <img src="" alt="" />
                        <p>Feedback</p>
                    </div>
                </div>
                <div className="main-page-right">
                    <div className="right-top">
                        <p>From { data.username }</p>
                        <p>{ data.open_date }</p>
                        <p>About</p>
                    </div>
                    <div className="right-bottom">
                    {/* Welcome to Uradi Encore Restaurant and Resort, where luxury meets hospitality in the heart of Kisii Town. As a prestigious 5-star hotel, we pride ourselves on offering a myriad of services and amenities to ensure an unforgettable experience for every guest. */}
                    { data.message }
                    </div>
                </div>
                </div> : 
                <div>
                    Ooops! You can only open this page from { data.open_date }
                </div>
            }
        </>

    )
}