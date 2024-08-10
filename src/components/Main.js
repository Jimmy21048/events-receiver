import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './App.css';
import confetti from 'canvas-confetti';
import { storage } from "./firebaseConfig";
import { getStorage, ref, getDownloadURL, child } from 'firebase/storage';

export default function Main() {
    const history = useNavigate();
    const {id} = useParams();
    const [data, setData] = useState([]);
    const today = new Date().getTime();
    const [message, setMessage] = useState(false);
    const [userResponse, setUserResponse] = useState('');
    const canvasRef = useRef(null);
    const [imageUrl, setImageUrl] = useState('');
    const [feedback2, setFeedback2] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            // confetti
            const myConfetti = confetti.create(canvasRef.current, {
                resize: true,
                useWorker: true
            })
    
            myConfetti({
                particleCount: 80, 
                spread: 70,
                origin: {
                    x: Math.random(),
                    y: Math.random() + 0.2
                },
                startVelocity: 40, 
                gravity: 0.5, 
            })
    
            setTimeout(() => {
                myConfetti.reset(); 
              }, 5000); 
    
            // confetti
    })
    useEffect(() => {
        if(id) {
            
            axios.post('https://birthday-site-server.onrender.com/sent', { id }, {
            // axios.post('http://localhost:3002/sent', { id }, {
                headers : {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                setLoading(false);
                if(response.data.error ||
                response.data.userError ||
                response.data.validationError ||
                response.data.tokenError) {
                    history('/');
                } else if(response.data.message)  {
                    setData(response.data.message[0]);
                    console.log(response.data);
                }
            })
        } else {
            history('/');
        }
    },[])

    useEffect(() => {
        if(data.r_image !== '') {
            const fetchImage = async () => {
                const storageRef = ref(storage, `${data.r_image}`);
                getDownloadURL(storageRef)
                .then(url => {
                    setImageUrl(url);
                }).catch(error => {
    
                })
            }
    
            fetchImage();
        }

    }, [data]);

    const handleSendResponse = () => {
        let responseElement = document.getElementById("feedback-text");
        axios.post('https://birthday-site-server.onrender.com/sent/feedback', { userResponse, id: data.r_id }, {
        // axios.post('http://localhost:3002/sent/feedback', { userResponse, id: data.r_id }, {
            headers : {
                'Content-Type' : 'application/json'
            }
        }).then(response => {
            setFeedback2(response.data);
            if(feedback2 === "Feedback Sent") {
                setUserResponse('');
                console.log(responseElement.value);
                responseElement.value = '';
            }
        })
    }
    
    if(loading) {
        return <div className="loading"><i class="fa-solid fa-circle-notch fa-spin"></i><h3>Just a sec... collecting data...</h3></div>
    }
    return (
        <>
            {
                today >= new Date(data.open_date).setHours(0, 0, 0, 0) ? 
                <div className="main-page">
                    {
                        message ? 
                        <div className="return-feedback">
                            <header>
                                <h3>Send Feedback</h3>
                                <button onClick={() => setMessage(false)}>X</button>
                            </header>

                            <textarea id="feedback-text"  name="feedback-text" value={userResponse} onChange={(e) => setUserResponse(e.target.value)} />
                            <button className="send" onClick={handleSendResponse}>Send</button>
                            <p>{ feedback2 }</p>
                        </div> : ''
                    }
                    <header className="main-page-header">
                        <a href="https://my-events-site.vercel.app" target="_blank" rel="noreferrer">About</a>
                    </header>
                    <div className="main-page-left">
                    <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
                            {/* <a href="https://my-events-site.vercel.app" rel="noreferrer" target="_blank">About</a> */}
                            {/* {/* <a href="http://localhost:3000" rel="noreferrer" target="_blank">About</a> */}
                        <div className="left-card">
                            <h1 className="card-header">HAPPY { data.event_type.toUpperCase() }</h1>
                            <h2 className="card-title">{ data.r_name }</h2>
                            <div className="card-body">{ data.message }</div>
                        </div>
                        <div className="right-card">
                            <img src={`${imageUrl}`} alt="my event" />
                        </div>
                        <div className="bottom-card">
                            <h3>From { data.username }</h3>
                            <p>{ data.open_date }</p>
                            <button className="btn-download">Download Card</button>
                            <button className="btn-feedback" onClick={() => setMessage(!message)}>Feedback</button>
                        </div>
                    </div>
                </div> : 
                <div className="wrong-date">
                    <p>Ooops! You can only open this page from { data.open_date }</p>
                    <p>Sender's rules &#128513;</p>
                </div>
            }
        </>

    )
}