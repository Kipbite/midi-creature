'use client'

import midiFileParser from 'midi-file-parser';
import Creature from './Creature';
import { useState } from 'react';
import { MidiEvent } from './lib';
import FileUpload from './FileUpload';
import ColorPicker from '@rc-component/color-picker';
import '@rc-component/color-picker/assets/index.css';


export default function Home() {
	const [ file, setFile ] = useState<File>();
	const [ ppq, setPpq ] = useState<number>();
	const [ ticksPerBeat, setTicksPerBeat ] = useState<number>();
	const [ events, setEvents ] = useState<MidiEvent[]>();
	const [ backgroundColor, setBackgroundColor ] = useState( '#ff0000' );
	const [ showPicker, setShowPicker ] = useState( false );

	if ( ! file ) {
		function handleUpload( formData: FormData ) {
			const midiFile = formData.get( 'midi-file' ) as File;
			setFile( midiFile );
		}

		return <FileUpload handleUpload={ handleUpload } />;
	}

	if ( ! ppq || ! ticksPerBeat || ! events ) {
		file.arrayBuffer().then( arrayBuffer => {
			const buffer = Buffer.from( arrayBuffer );
			const string = buffer.toString( 'binary' );
			const midi = midiFileParser( string );
	
			const ppq = midi.tracks[0][0].microsecondsPerBeat;
			const { ticksPerBeat } = midi.header;
	
			setPpq( ppq );
			setTicksPerBeat( ticksPerBeat );
			setEvents( midi.tracks[1] );
		} );

		return 'Loading...';
	}

	return (
		<div style={{
			width: '100vw',
			height: '100vh',
			background: backgroundColor
		}}>
			<Creature
				events={ events }
				ppq={ ppq }
				ticksPerBeat={ ticksPerBeat }
			/>

			<button onClick={() => setShowPicker( ! showPicker )}>
				{ showPicker ? 'Hide' : 'Show' } BG Colour Picker
			</button>
			{ showPicker &&
				<div style={{ display: 'flex' }}>
					<ColorPicker
						value={ backgroundColor }
						onChange={ color => setBackgroundColor( color.toHexString() ) }
					/>
				</div>
			}
		</div>
	);
}
