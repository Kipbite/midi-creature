import midiFileParser from 'midi-file-parser';
import fs from 'fs';
import Creature from './Creature';

export default function Home() {
	const file = fs.readFileSync( './public/test.mid', 'binary' );
	const midi = midiFileParser( file );

	const ppq = midi.tracks[0][0].microsecondsPerBeat;
	const { ticksPerBeat } = midi.header;

	console.log( 'ppq: ', ppq );
	console.log( 'ticksPerBeat: ', ticksPerBeat );
	
	return (
		<Creature
			events={ midi.tracks[1] }
			ppq={ ppq }
			ticksPerBeat={ ticksPerBeat }
		/>
	);
}
