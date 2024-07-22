import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './App.css';
import confetti from 'canvas-confetti';
import { storage } from "./firebaseConfig";
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

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

    useEffect(() => {
            // confetti
            const myConfetti = confetti.create(canvasRef.current, {
                resize: true,
                useWorker: true
            })
    
            myConfetti({
                particleCount: 80, 
                spread: 60,
                origin: {
                    x: Math.random(),
                    y: Math.random() - 0.2
                },
                startVelocity: 50, 
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
                if(response.data.error ||
                response.data.userError ||
                response.data.validationError ||
                response.data.tokenError) {
                    history('/');
                } else if(response.data.message)  {
                    setData(response.data.message[0]);
                }
            })
        } else {
            history('/');
        }
    },[])

    useEffect(() => {
        const fetchImage = async () => {
            console.log(data.r_image);
            try {
                const storageRef = ref(storage, data.r_image);
                const url = await getDownloadURL(storageRef);
                setImageUrl(url);
            } catch(error) {
                console.error('Error fetching image:', error);
            }
        }

        fetchImage();
    }, [data]);

    const handleSendResponse = () => {
        axios.post('https://birthday-site-server.onrender.com/sent/feedback', { userResponse, id: data.r_id }, {
        // axios.post('http://localhost:3002/sent/feedback', { userResponse, id: data.r_id }, {
            headers : {
                'Content-Type' : 'application/json'
            }
        }).then(response => {
            setFeedback2(response.data);
            if(feedback2 === "Feedback Sent") {
                setUserResponse('');
            }
        })
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

                            <textarea  name="feedback-text" value={userResponse} onChange={(e) => setUserResponse(e.target.value)} />
                            <button className="send" onClick={handleSendResponse}>Send</button>
                            <p>{ feedback2 }</p>
                        </div> : ''
                    }
                    <div className="main-page-left">
                    <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
                    <div className="event-info">
                            <h1>HAPPY <br/> { data.event_type }</h1>
                            <h4>{ data.r_name }</h4>
                        </div>
                        <div className="img-feedback">
                            <img src={imageUrl} alt="firebase" />
                            <button onClick={() =>setMessage(message => !message)}>Feedback</button>
                        </div>
                    </div>
                    <div className="main-page-right">
                        <div className="right-top">
                            <p>From { data.username }</p>
                            <p>{ data.open_date }</p>
                            <a href="http://localhost:3000" rel="noreferrer" target="_blank">About</a>
                        </div>
                        <div className="right-bottom">
                        "{ data.message }"
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