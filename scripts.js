const datasetConfigs = [
    {
        id: "aishell3",               
        folder: "aishell3_datasets",  
        name: "AISHELL3 dataset (Trained on LibriTTS)",     
        samples: 6,                   
        models: ["ref", "hifigan", "bigvgan", "vocos", "wavefm", "rfwave", "degvoc"],
        modelNames: ["Ground Truth", "HiFi-GAN", "BigVGAN", "Vocos", "WaveFM", "RFWave", "DegVoC(Ours)"]
    },
    {
        id: "ears",
        folder: "ears_datasets",
        name: "EARS dataset (Trained on LibriTTS)",
        samples: 6,
        models: ["ref", "hifigan", "bigvgan", "vocos", "wavefm", "rfwave", "degvoc"],
        modelNames: ["Ground Truth", "HiFi-GAN", "BigVGAN", "Vocos", "WaveFM", "RFWave", "DegVoC(Ours)"]
    },
    {
        id: "musdb18",
        folder: "musdb18_datasets",
        name: "MUSDB18 vocals dataset (Trained on LibriTTS)",
        samples: 6,
        models: ["ref", "hifigan", "bigvgan", "vocos", "wavefm", "rfwave", "degvoc"],
        modelNames: ["Ground Truth", "HiFi-GAN", "BigVGAN", "Vocos", "WaveFM", "RFWave", "DegVoC(Ours)"]
    }
];


function initDataset(config) {
    const container = document.getElementById(config.id);
    if (!container) return;
    for (let sampleIdx = 1; sampleIdx <= config.samples; sampleIdx++) {
        const caseSection = document.createElement('div');
        caseSection.className = 'subsection';
        caseSection.innerHTML = `<h3>Case ${sampleIdx}</h3>`;  
        
        const table = createAudioTable(
            {
                models: config.models,
                modelNames: config.modelNames
            },
            sampleIdx,
            `audio_samples/${config.folder}` 
        );
        caseSection.appendChild(table);
        container.appendChild(caseSection);
    }
}



function createAudioTable(config, sampleIndex, basePath) {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    
    const table = document.createElement('table');
    table.className = 'tg';

    const maxColumnsPerRow = 7;  
    const totalModels = config.models.length;

    for (let row = 0; row < totalModels; row += maxColumnsPerRow - 1) {
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<td class="tg-header">Audio Samples</td>` +
            config.modelNames.slice(row, row + maxColumnsPerRow - 1)
                .map(model => `<td class="tg-header">${model}</td>`)
                .join('');
        table.appendChild(headerRow);

        const dataRow = document.createElement('tr');
        dataRow.innerHTML = `<td class="tg-cell"></td>`;

        for (let col = 0; col < maxColumnsPerRow - 1; col++) {
            const modelIndex = row + col;
            if (modelIndex < totalModels) {
                const model = config.models[modelIndex];
                const audioSrc = `${basePath}/${model}/sample${sampleIndex}.wav`;
                dataRow.innerHTML += `
                    <td class="tg-cell">
                        <div class="media-container">
                            <audio controls class="lazy-audio" data-src="${audioSrc}">
                                Your browser does not support the audio element.
                             </audio>
                            <a href="${audioSrc}" download class="audio-download">Download</a>
                        </div>
                    </td>
                `;
            } else {
                dataRow.innerHTML += '<td class="tg-cell"></td>';
            }
        }
        table.appendChild(dataRow);
    }

    wrapper.appendChild(table);
    return wrapper;
}


document.addEventListener('DOMContentLoaded', function() {
    try {
        datasetConfigs.forEach(config => initDataset(config));
        initLazyLoading(); 

        document.addEventListener('play', function(e) {
            if (e.target.tagName === 'AUDIO') {
                document.querySelectorAll('audio').forEach(audio => {
                    if (audio !== e.target) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                });
            }
        }, true);
    } catch (error) {
        console.error('Initialization error:', error);
    }
});


function initLazyLoading() {
    try {
        const audioObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const audio = entry.target;
                    if (audio.dataset.src && !audio.querySelector('source')) {
                        const source = document.createElement('source');
                        source.src = audio.dataset.src;
                        source.type = 'audio/wav';
                        audio.appendChild(source);
                        audio.load().catch(err => console.error('Audio load error:', err));
                        audio.classList.remove('lazy-audio');
                        observer.unobserve(audio);
                    }
                }
            });
        }, { rootMargin: '200px 0px' });

        document.querySelectorAll('.lazy-audio').forEach(audio => {
            audioObserver.observe(audio);
        });

        let lazyLoadThrottleTimeout;
        window.addEventListener('scroll', function() {
            if (lazyLoadThrottleTimeout) clearTimeout(lazyLoadThrottleTimeout);
            lazyLoadThrottleTimeout = setTimeout(() => {
                document.querySelectorAll('.lazy-audio:not(:has(source))').forEach(audio => {
                    const rect = audio.getBoundingClientRect();
                    if (rect.top < window.innerHeight + 200) {
                        const source = document.createElement('source');
                        source.src = audio.dataset.src;
                        source.type = 'audio/wav';
                        audio.appendChild(source);
                        audio.load().catch(err => console.error('Audio load error:', err));
                        audio.classList.remove('lazy-audio');
                    }
                });
            }, 200);
        });
    } catch (error) {
        console.error('Lazy loading error:', error);
    }
}


const style = document.createElement('style');
style.textContent = `
    .lazy-audio {
        background-color: #f8f8f8;
        min-height: 40px;
    }
    .media-container {
        position: relative;
        margin-bottom: 12px;
    }
    .audio-download {
        display: inline-block;
        margin-top: 6px;
        color: #0066cc;
        text-decoration: none;
        font-size: 0.9em;
    }
    .audio-download:hover {
        text-decoration: underline;
    }
    .table-wrapper {
        margin-bottom: 20px;
        overflow-x: auto;
    }
    table.tg {
        border-collapse: collapse;
        width: 100%;
    }
    .tg-header {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: center;
        background-color: #f0f0f0;
    }
    .tg-cell {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: center;
    }
    .subsection {
        margin-bottom: 30px;
    }
`;
document.head.appendChild(style);