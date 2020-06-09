import datajoint as dj
dj.config["enable_python_native_blobs"] = True
dj.config['stores'] = {
  'local': dict(  # 'regular' external storage for this pipeline
                protocol='file',
                location='/data/nwb_builder_test_data/dj/',
                stage='/data/nwb_builder_test_data/dj/'),
  'local-filtered': dict( # 'local_filtered' storage filtered data in hdf5 files
                protocol='file',
                location='/data/nwb_builder_test_data/dj/filtered/',
                stage='/data/nwb_builder_test_data/dj/filtered/')
}
dj.config["database.user"] = 'root'
dj.config["database.password"] = 'tutorial'

import labbox_ephys as le

from franklab_datajoint.schema import common_session
from franklab_datajoint.schema import common_lab
from franklab_datajoint.schema import common_subject
from franklab_datajoint.schema import common_device
from franklab_datajoint.schema import common_task
from franklab_datajoint.schema import common_session
from franklab_datajoint.schema import common_interval
from franklab_datajoint.schema import common_ephys
from franklab_datajoint.schema import common_behav

def nwb_populate(file_names):
    #print('file names:', file_names)

    # CHANGE per object when object_ids are implemented in the NWB file
    default_nwb_object_id = 0
    for nwb_raw_file_name in file_names:
        # datajoint has to compute the full hash of the file to tell if it is a duplicate, so we skip the file if it
        # exists
        if not len((common_session.Nwbfile() & {'nwb_raw_file_name' : nwb_raw_file_name}).fetch('nwb_file_name')):
            common_session.Nwbfile().insert_nwb_file(nwb_raw_file_name)
        # get the name of the linked file
        nwb_file_name = (common_session.Nwbfile() & {'nwb_raw_file_name' : nwb_raw_file_name}).fetch1('nwb_file_name')

        ''' UNCOMMENT AND FIX when NWB export functionality works. 
        # start by making a copy of the file. Eventually this should have everything EXCEPT the e-series, but
        # for the moment it is just a shallow copy. This should also be managed by DataJoint eventually
        nwbf = nwb_raw_f.copy()
        nwb_file_name = os.path.splitext(nwb_raw_file_name)[0] + '_pp.nwb'
        io.close()
        # write this file so we can use it for everything else
        with pynwb.NWBHDF5IO(nwb_file_name, 'w') as io:
            io.write(nwbf)
        '''
        #TEMPORARY HACK: create a copy of the original file:

        # nwb_file_name = os.path.splitext(nwb_raw_file_name)[0] + '_pp.nwb'
        # if not os.path.exists(nwb_file_name):
        #     print('Copying file; this step will be removed once NWB export functionality works')
        #     shutil.copyfile(nwb_raw_file_name, nwb_file_name)
        #
        # FIX: create insert_from_nwb method for Institution and Lab
        """
        Institution, Lab, and Experimenter
        """
        common_lab.Institution().insert_from_nwb(nwb_file_name)
        common_lab.Lab().insert_from_nwb(nwb_file_name)
        common_lab.LabMember().insert_from_nwb(nwb_file_name)

        """
        Subject
        """
        common_subject.Subject().insert_from_nwb(nwb_file_name)

        """
        Device
        """
        common_device.Device().insert_from_nwb(nwb_file_name)
        common_device.Probe().insert_from_nwb(nwb_file_name)

        """
        Task and Apparatus Information structures.
        These hold general information not specific to any one epoch. Specific information is added in task.TaskEpoch
        """
        common_task.Task().insert_from_nwb(nwb_file_name)
        # common_task.Apparatus().insert_from_nwb(nwb_file_name)


        # now that those schema are updated, we can populate the Session and Experimenter lists and then insert the
        # rest of the schema
        common_session.Session.populate()
        common_session.ExperimenterList.populate()

        common_interval.IntervalList().insert_from_nwb(nwb_file_name)
        # populate the electrode configuration table for this session
        common_ephys.ElectrodeConfig().insert_from_nwb(nwb_file_name)
        common_ephys.Raw().insert_from_nwb(nwb_file_name)

        #common_task.TaskEpoch.insert_from_nwb(nwb_file_name)


        # ephys.Units.populate()

        # populate the behavioral variables. Note that this has to be done after task.TaskEpoch
        common_behav.RawPosition.populate()
        # common_behav.HeadDir.populate()
        # common_behav.Speed.populate()
        # common_behav.LinPos.populate()

nwb_populate(['/data/import/beans20190718.nwb'])