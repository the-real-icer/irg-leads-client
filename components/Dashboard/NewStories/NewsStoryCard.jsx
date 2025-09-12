import PropTypes from 'prop-types';

const NewsStoryCard = ({ story }) => (
    <div
        className="surface-card border-round shadow-2 p-4 text-center"
        style={{ pointer: 'cursor' }}
    >
        <a target="_blank" href={story.url} rel="noopener noreferrer">
            <img
                src={story.urlToImage}
                alt="windows"
                className="mx-auto block mb-4"
                style={{ height: '200px' }}
            />
            <div className="text-900 font-medium mb-3 text-xl">{story.source.name}</div>
            <p className="mt-0 mb-4 p-0 line-height-3">{story.title}</p>
        </a>
    </div>
);

NewsStoryCard.propTypes = {
    story: PropTypes.shape({
        source: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }),
        title: PropTypes.string.isRequired,
        urlToImage: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
    }).isRequired,
};

export default NewsStoryCard;
