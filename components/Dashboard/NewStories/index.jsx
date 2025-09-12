import { Fragment } from 'react';

// Redux
import { useSelector } from 'react-redux';

import NewsStoryCard from './NewsStoryCard';

const NewsStories = () => {
    // __________________Redux State______________________\\
    const newsStories = useSelector((state) => state.newsStories);

    return (
        <Fragment>
            {newsStories && newsStories.length && (
                <Fragment>
                    <div className="col-12 lg:col-4">
                        <NewsStoryCard story={newsStories[0]} />
                    </div>
                    <div className="col-12 lg:col-4">
                        <NewsStoryCard story={newsStories[1]} />
                    </div>
                    <div className="col-12 lg:col-4">
                        <NewsStoryCard story={newsStories[2]} />
                    </div>
                </Fragment>
            )}
        </Fragment>
    );
};

export default NewsStories;
