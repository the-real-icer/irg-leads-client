import PropTypes from 'prop-types';

import PrintablePropertySheet from './PrintablePropertySheet';
import PrintableTourCoverPage from './PrintableTourCoverPage';
import PrintableTourSummaryPage from './PrintableTourSummaryPage';

const PrintableTourPacket = ({
    name,
    client,
    agent,
    scheduledDate,
    stops,
    generatedAt,
    hasUnsavedChanges,
}) => (
    <>
        <PrintableTourCoverPage
            name={name}
            client={client}
            scheduledDate={scheduledDate}
            stopCount={stops.length}
            generatedAt={generatedAt}
            hasUnsavedChanges={hasUnsavedChanges}
        />
        <PrintableTourSummaryPage
            name={name}
            client={client}
            agent={agent}
            scheduledDate={scheduledDate}
            stops={stops}
        />
        {stops.map((stop, index) => (
            <PrintablePropertySheet
                key={stop.mls_number || `${index}-${stop.address}`}
                property={stop}
                stopNumber={index + 1}
                showingStatus={stop.status}
                scheduledTime={stop.scheduled_time}
                note={stop.note}
                agentContact={agent}
            />
        ))}
    </>
);

PrintableTourPacket.propTypes = {
    name: PropTypes.string,
    client: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
    }),
    agent: PropTypes.shape({
        name: PropTypes.string,
        image: PropTypes.string,
        title: PropTypes.string,
        display_email: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
    }),
    scheduledDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    stops: PropTypes.arrayOf(PropTypes.shape({
        mls_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        address: PropTypes.string,
        status: PropTypes.string,
        scheduled_time: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
        note: PropTypes.string,
    })).isRequired,
    generatedAt: PropTypes.instanceOf(Date).isRequired,
    hasUnsavedChanges: PropTypes.bool,
};

PrintableTourPacket.defaultProps = {
    name: '',
    client: null,
    agent: null,
    scheduledDate: null,
    hasUnsavedChanges: false,
};

export default PrintableTourPacket;
