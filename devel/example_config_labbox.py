import json
import kachery_p2p as kp

def main():
    # Here is an example where we configure a labbox deployment
    # Run this script and then pay attention to the output script

    # # Replace this with some name for your config
    # config_name = 'dubb'
    # # Replace this with the URI of the compute resource
    # crfeed_uri = 'feed://4dd6d6aa9e1d7be35e7374e6b35315bffefcfec27a9af36fa2e30bfd6753c5dc?name=dubb'

    # Replace this with some name for your config
    config_name = 'ephys1'
    # Replace this with the URI of the compute resource
    crfeed_uri = 'feed://09b27ce6c71add9fe6effaf351fce98d867d6fa002333a8b06565b0a108fb0ba?name=ephys1'

    config = {
        'job_handlers': {
            'default': {
                'type': 'local'
            },
            'partition1': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_partition': 'partition1'
            },
            'partition2': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_partition': 'partition2'
            },
            'partition3': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_partition': 'partition3'
            },
            'timeseries': {
                'type': 'local'
            }
        }
    }
    config_uri = kp.store_object(config, basename=f'labbox_config_{config_name}.json')
    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    print(json.dumps(config, indent=4))
    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    print('')
    print(f'Configuration URI: {config_uri}')
    print('')
    print(f'To use this config, set the following environment variable in the deployed container:')
    print(f'LABBOX_CONFIG_URI={config_uri}')
    print('')
    print('You must also ensure that the kachery-p2p node of the deployed container has access to the compute resource')

def _get_last_message(subfeed):
    n = subfeed.get_num_messages()
    if n == 0:
        return None
    subfeed.set_position(n-1)
    return subfeed.get_next_message(wait_msec=1000)

if __name__ == '__main__':
    main()