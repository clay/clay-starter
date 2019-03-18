'use strict';

const _find = require('lodash/find'),
  $popup = require('../../services/client/popup');

module.exports = (el) => {
  const socialMediaButtons = el.querySelectorAll('.social-media-btn'),
    // new social media network should also be added to 'socialMediaLinks in schema.yaml'
    supportedSocialNetworks = [
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

  if (socialMediaButtons) {
    socialMediaButtons.forEach((element)=>{
      element.addEventListener('click', (e) => {
        let Position = $popup.position,
          Params = $popup.params,
          opts = {},
          dimensions = { width: 780, height: 500 },
          features = new Position(dimensions.width, dimensions.height),
          classList = e.currentTarget.classList,
          args,
          socialHandler,
          socialNetworks = supportedSocialNetworks;

        opts.handle = e.currentTarget.getAttribute('data-handle');

        dimensions.left = features.left;
        dimensions.top = features.top;

        socialHandler = _find(socialNetworks, function (socialNetwork) {
          return classList.contains(socialNetwork.className);
        });

        opts.url = socialHandler.url.replace('{handle}', opts.handle);
        opts.network = socialHandler.network;

        opts.name = 'Follow ' + opts.handle + ' on ' + opts.network;
        args = new Params(opts, dimensions);
        window.open(args.address, args.name, args.features);
        e.preventDefault();
      });
    });
  }
};
