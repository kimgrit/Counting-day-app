import { Text } from '@toss/tds-mobile';
import './BannerAd.css';

function BannerAd({ placement }) {
  return (
    <div className="BannerAd-root" data-placement={placement}>
      <Text typography="st7" color="adaptive.grey600" textAlign="center">
        광고 영역
      </Text>
    </div>
  );
}

export default BannerAd;

