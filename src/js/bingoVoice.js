/* Used to manage the voice operation */
class BingoVoice {

    constructor(){
        this.Voices = {} 
        this.CurrentVoice = undefined;
        this.IsSpeaking = false;
    }

    // Add a voice to the set of voices
    addVoice(name, voice){
        let lang = voice.lang;
        this.Voices[name] = voice;

        let isFirstVoice = (this.CurrentVoice == undefined);
        let selectedFlag = (isFirstVoice) ? "selected" : "";

        let option = `<option data-name="${name}" data-lang="${lang}" ${selectedFlag}>${name}</option>`
        MyDom.setContent("#voiceSelect", {"innerHTML":option}, true);

        if(isFirstVoice){
            this.setCurrentVoice(name);
        }
    }

    // Set current voice
    setCurrentVoice(name="Alex"){
        let voice = this.Voices[name] ?? undefined;
        this.CurrentVoice = voice;
    }

    async speakText(text, rate=0.9, pause=500) {

        if(this.IsSpeaking){ return; }
        if(this.CurrentVoice == undefined){ return; }

        return new Promise( (resolve) =>{
            let synth = window.speechSynthesis;
            var msg = new SpeechSynthesisUtterance();
            msg.rate = rate;
            msg.text = text; 
            msg.voice = this.CurrentVoice;

            synth.speak(msg);

            var stillSpeaking = setInterval( () => {
                
                this.IsSpeaking = synth.speaking; 

                if(synth.speaking){
                    MyLogger.LogInfo("Still speaking");
                } else {
                    setTimeout( ()=> {
                        clearInterval(stillSpeaking);
                        resolve(true);    
                    }, pause);
                }
            }, 500);
        });
    }

    async demo(){
        var speakerName = this.CurrentVoice?.name ?? "";
        if(speakerName != ""){
            var text = "Hello. My name is " + speakerName + ". And this is how I would call a number:"
            await this.speakText(text);
	    	var subtext = "I 20";
		    await this.speakText(subtext, 0.6);
        }
    }
}

// The constant BINGO voice object
const MyBingoVoice = new BingoVoice();
var speechSynth = window.speechSynthesis;
const getVoices = () => {
    var results = [];
    var voices = speechSynth.getVoices();
    voices.forEach( (voice) => {
        var isEnglighGoogle = (voice.lang.includes("en") && !voice.name.includes("Google"));
        if(isEnglighGoogle){
            let name = voice.name;
            MyBingoVoice.addVoice(name, voice);
        }
    });
    return results;
}
// Load the voices; With a listener for changes
var loadVoices = () =>{
    getVoices();
    if(speechSynthesis.onvoiceschanged !== undefined){
        speechSynthesis.onvoiceschanged = getVoices;
    }
}
// Load the voices
loadVoices();


/************** ACTIONS *****************/
// On changing speaker
function onChangeVoice(event){
    let target = event.target;
    let value = target?.value ?? "";
    MyBingoVoice.setCurrentVoice(value);
}

// On Speak
async function onTestSpeaker(){
    await MyBingoVoice.demo();
}
