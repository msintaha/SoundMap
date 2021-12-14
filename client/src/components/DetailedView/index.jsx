import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './_index.scss';
import Service from '../../services/Service';
import SkeletonLoader from '../SkeletonLoader';
import { Box, Tabs, Tab } from '@mui/material';

function DetailedView({ data, fileDataAttr, sampleRateAttr, xAxisAttr, categoryToFilterBy, yAxisAttr}) {
	const [spectrogram, setSpectrogram] = useState('');
	const [waveplot, setWaveplot] = useState('');
	const [tabIndex, setTabIndex] = useState(0);
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		const soundData = data[fileDataAttr].split(',').map(Number);
		const sampleRate = Number(data[sampleRateAttr]);
		Promise.all([
			Service.generateSpectrogram({ sound_data: soundData, sample_rate: sampleRate }),
			Service.generateWaveplot({ sound_data: soundData, sample_rate: sampleRate })
		]).then(([_spectrogram, _waveplot]) => {
			setSpectrogram(_spectrogram);
			setWaveplot(_waveplot);
			setLoading(false);
		})
	}, [data]);

  return isLoading ? <SkeletonLoader /> : (
    <div className="sm-DetailedView">
		<div className="sm-DetailedView-chart">
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={tabIndex} onChange={(e, _tabIndex) => setTabIndex(_tabIndex)}>
					<Tab label="Spectrogram" />
					<Tab label="Waveplot" />
				</Tabs>
			</Box>
			{tabIndex === 0 &&
				<img src={spectrogram} className="sm-DetailedView-spectrogram" />
			}
			{tabIndex === 1 &&
				<img src={waveplot} className="sm-DetailedView-waveplot" />
			}
		</div>
		<div className="sm-DetailedView-container">
			<h6 className="sm-DetailedView-heading">DETAILS</h6>
			<div className="sm-DetailedView-metadata">
				{Object.entries(data).filter(([k, v]) => !['x', 'y', 'vy', 'vx', fileDataAttr].includes(k))
					.map(([key, value]) => <div><strong>{key}:</strong> {isNaN(parseFloat(value)) ? value : parseFloat(value).toFixed(2)}</div>)}
			</div>
		</div>
    </div>
  );
}


DetailedView.propTypes = {
	xAxisAttr: PropTypes.string,
	yAxisAttr: PropTypes.string,
	categoryToFilterBy: PropTypes.string,
	data: PropTypes.object,
}

export default DetailedView;
