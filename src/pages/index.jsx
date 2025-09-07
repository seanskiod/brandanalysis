import Layout from "./Layout.jsx";

import Home from "./Home";

import Results from "./Results";

import ContentReadiness from "./ContentReadiness";

import AIVisibility from "./AIVisibility";

import Menu from "./Menu";

import Industry from "./Industry";

import HowItWorks from "./HowItWorks";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Results: Results,
    
    ContentReadiness: ContentReadiness,
    
    AIVisibility: AIVisibility,
    
    Menu: Menu,
    
    Industry: Industry,
    
    HowItWorks: HowItWorks,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Results" element={<Results />} />
                
                <Route path="/ContentReadiness" element={<ContentReadiness />} />
                
                <Route path="/AIVisibility" element={<AIVisibility />} />
                
                <Route path="/Menu" element={<Menu />} />
                
                <Route path="/Industry" element={<Industry />} />
                
                <Route path="/HowItWorks" element={<HowItWorks />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}