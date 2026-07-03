const complaintKeywords = {
    'Plumbing': [
        'water', 'leak', 'pipe', 'drain', 'faucet', 'toilet', 'sink', 'shower',
        'flooding', 'moisture', 'wet', 'drip', 'flow', 'basin', 'tap'
    ],
    'Electrical': [
        'wire', 'socket', 'switch', 'light', 'power', 'electric', 'bulb', 'outlet',
        'sparks', 'voltage', 'circuit', 'breaker', 'cable', 'plug', 'adapter'
    ],
    'Elevator': [
        'elevator', 'lift', 'button', 'door', 'shaft', 'floor', 'emergency',
        'stuck', 'malfunction', 'cabin', 'motor', 'cable'
    ],
    'Security': [
        'lock', 'key', 'gate', 'camera', 'alarm', 'fence', 'guard', 'access',
        'entry', 'surveillance', 'intercom', 'buzzer', 'safety'
    ],
    'Cleaning': [
        'garbage', 'trash', 'dirty', 'stain', 'mess', 'sweep', 'mop', 'dust',
        'waste', 'hygiene', 'sanitation', 'debris', 'litter'
    ],
    'Parking': [
        'car', 'vehicle', 'parking', 'slot', 'garage', 'ramp', 'barrier',
        'marking', 'space', 'reserved', 'tow', 'unauthorized'
    ],
    'Common Area': [
        'lobby', 'hall', 'garden', 'pool', 'gym', 'playground', 'terrace',
        'corridor', 'staircase', 'mailbox', 'community', 'recreational'
    ]
};

const analyzeComplaintPhoto = async (imageUrl, description = '') => {
    try {
        const textToAnalyze = description.toLowerCase();
        const scores = {};

        Object.keys(complaintKeywords).forEach(category => {
            scores[category] = 0;
            complaintKeywords[category].forEach(keyword => {
                if (textToAnalyze.includes(keyword)) {
                    scores[category] += 1;
                }
            });
        });

        const maxScore = Math.max(...Object.values(scores));
        if (maxScore === 0) {
            return {
                suggestedCategory: 'Other',
                confidence: 0.3,
                analysis: 'No clear category detected from description'
            };
        }

        const suggestedCategory = Object.keys(scores).find(
            category => scores[category] === maxScore
        );

        const totalWords = textToAnalyze.split(' ').length;
        const confidence = Math.min(0.9, (maxScore / totalWords) * 2 + 0.4);

        return {
            suggestedCategory,
            confidence: Math.round(confidence * 100) / 100,
            analysis: `Detected ${maxScore} relevant keywords for ${suggestedCategory}`,
            allScores: scores
        };

    } catch (error) {
        console.error('Photo analysis error:', error);
        return {
            suggestedCategory: 'Other',
            confidence: 0.3,
            analysis: 'Analysis failed, please select category manually'
        };
    }
};

const analyzeLostFoundPhoto = async (imageUrl, description = '') => {
    try {
        const textToAnalyze = description.toLowerCase();

        const categoryKeywords = {
            'Electronics': ['phone', 'laptop', 'tablet', 'charger', 'headphones', 'camera', 'remote', 'device'],
            'Clothing': ['shirt', 'jacket', 'shoes', 'dress', 'pants', 'hat', 'scarf', 'clothing'],
            'Keys': ['key', 'keychain', 'fob', 'remote', 'access card'],
            'Documents': ['paper', 'document', 'id', 'passport', 'license', 'certificate', 'card'],
            'Jewelry': ['ring', 'necklace', 'watch', 'bracelet', 'earring', 'jewelry'],
            'Books': ['book', 'notebook', 'diary', 'magazine', 'manual'],
            'Sports': ['ball', 'racket', 'equipment', 'sports', 'fitness', 'gear'],
            'Toys': ['toy', 'game', 'doll', 'puzzle', 'lego', 'stuffed']
        };

        const scores = {};
        Object.keys(categoryKeywords).forEach(category => {
            scores[category] = 0;
            categoryKeywords[category].forEach(keyword => {
                if (textToAnalyze.includes(keyword)) {
                    scores[category] += 1;
                }
            });
        });

        const maxScore = Math.max(...Object.values(scores));
        if (maxScore === 0) {
            return {
                suggestedCategory: 'Other',
                confidence: 0.4,
                tags: []
            };
        }

        const suggestedCategory = Object.keys(scores).find(
            category => scores[category] === maxScore
        );

        const tags = categoryKeywords[suggestedCategory].filter(
            keyword => textToAnalyze.includes(keyword)
        );

        return {
            suggestedCategory,
            confidence: Math.min(0.95, maxScore * 0.2 + 0.5),
            tags,
            allScores: scores
        };

    } catch (error) {
        console.error('Lost/Found analysis error:', error);
        return {
            suggestedCategory: 'Other',
            confidence: 0.3,
            tags: []
        };
    }
};

module.exports = {
    analyzeComplaintPhoto,
    analyzeLostFoundPhoto
};