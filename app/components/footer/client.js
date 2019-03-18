'use strict';

const _find = require('lodash/find'),
  $popup = require('../../services/client/popup');

module.exports = (el) => {
  const followBotton = el.querySelectorAll('.socialmedia-link');

  if (followBotton) {
    followBotton.forEach((element)=>{
      element.addEventListener('click', (e) => {
        debugger;
        let Position = $popup.position,
          Params = $popup.params,
          opts = {},
          dims = { w: 780, h: 500 },
          features = new Position(dims.w, dims.h),
          classList = e.currentTarget.classList,
          args,
          socialHandler,
          socialNetworks = [
            {
              className: 'facebook',
              url: 'https://facebook.com/{handle}',
              network: 'Facebook'
            },
            {
              className: 'instagram',
              url: 'https://www.instagram.com/{handle}',
              network: 'Instagram'
            },
            {
              className: 'twitter',
              url: 'https://twitter.com/intent/follow?screen_name={handle}&tw_p=followbutton&variant=2.0',
              network: 'Twitter'
            }
          ];

        opts.handle = e.currentTarget.getAttribute('data-handle');

        dims.left = features.left;
        dims.top = features.top;

        socialHandler = _find(socialNetworks, function (socialNetwork) {
          return classList.contains(socialNetwork.className);
        });

        opts.url = socialHandler.url.replace('{handle}', opts.handle);
        opts.network = socialHandler.network;

        opts.name = 'Follow ' + opts.handle + ' on ' + opts.network;
        args = new Params(opts, dims);
        window.open(args.address, args.name, args.features);
        e.preventDefault();
      });
    });

  }
};


