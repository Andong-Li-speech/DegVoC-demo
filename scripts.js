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
                dataRow.innerHTML += `
                    <td class="tg-cell">
                        <div class="media-container">
                            <audio controls class="lazy-audio" data-src="${basePath}/${model}/sample${sampleIndex}.wav">
                                <p>Audio will load when visible</p>
                            </audio>
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
});


function initLazyLoading() {
    const audioObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const audio = entry.target;
                if (audio.dataset.src && !audio.querySelector('source')) {
                    const source = document.createElement('source');
                    source.src = audio.dataset.src;
                    source.type = 'audio/wav';
                    audio.appendChild(source);
                    audio.load();
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
                    audio.classList.remove('lazy-audio');
                }
            });
        }, 200);
    });
}


const style = document.createElement('style');
style.textContent = `
    .lazy-audio {
        background-color: #f8f8f8;
        min-height: 40px;
    }
    .media-container {
        position: relative;
    }
`;
document.head.appendChild(style);