import { useEffect, useRef, useState } from 'react';
import './MainScreen.css'
import { askLLM } from './lib/llm';

export const MainScreen: React.FC = () => {
    const awaitingAiResponse = useRef(false);

    useEffect(() => {
        if (!awaitingAiResponse.current) {
            awaitingAiResponse.current = true;
            (async () => {
                const report = await askLLM(
                    'You are an oboard drone AI.',
                    'What is in the image?',
                ).then((response) => {    
                    awaitingAiResponse.current = false;
                    console.log(response);
                });
            })();
        }
    }, [])

    return (
        <div>
            <div className="image-box">IMAGE BOX</div>
            <div className="right-panel">RIGHT PANEL</div>
            <div className="bottom-panel">BOTTOM PANEL</div>
        </div>
    );
}