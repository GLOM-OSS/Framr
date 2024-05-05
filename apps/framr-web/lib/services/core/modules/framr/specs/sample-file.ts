export const sampleFileContent = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<LIST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <INFO>
    <VERSION>V5.98</VERSION>
    <DATE>21/02/2022</DATE>
    <NAME>
    </NAME>
  </INFO>
  <TOOL NAME="ADN" VERSION="8.5B04" LONG="adnVISION 675">
    <MANDATORY>
      <DPOINT NAME="ADNSTAT" MTF="" GTF="" ROT="" UTIL="x" />
      <DPOINT NAME="ADNSK_a" MTF="x" GTF="x" ROT="x" UTIL="" />
    </MANDATORY>
    <RECOMENDED />
    <SERVICES>
      <SERVICE NAME="Batteryless Operation" INTERACT="">
        <DPOINT NAME="ADNSTAT" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Delta Tool Movement" INTERACT="">
        <DPOINT NAME="DM15_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="DM37_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density - Average" INTERACT="RHOB_ADN_RT DRHO_ADN_RT DRHO_DH_ADN_RT RHOB_DH_ADN_RT">
        <DPOINT NAME="RHOB_a" MTF="x" GTF="x" ROT="x" UTIL="" />
        <DPOINT NAME="DRHO_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density - Bottom" INTERACT="ROBB_RT ROBB_DH_RT DRHB_RT DRHB_DH_RT">
        <DPOINT NAME="ROBB_a" MTF="x" GTF="x" ROT="x" UTIL="" />
        <DPOINT NAME="DRHB_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density - Left" INTERACT="ROBB_RT ROBB_DH_RT DRHB_RT DRHB_DH_RT">
        <DPOINT NAME="ROBL_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="DRHL_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density - Right" INTERACT="ROBB_RT ROBB_DH_RT DRHB_RT DRHB_DH_RT">
        <DPOINT NAME="ROBR_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="DRHR_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density - Up" INTERACT="ROBU_RT ROBU_DH_RT DRHU_RT DRHU_DH_RT">
        <DPOINT NAME="ROBU_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="DRHU_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density (LS &amp; SS) - Average" INTERACT="">
        <DPOINT NAME="RHOS_a" MTF="x" GTF="x" ROT="x" UTIL="" />
        <DPOINT NAME="RHOL_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density (LS &amp; SS) - Bottom" INTERACT="">
        <DPOINT NAME="ROSB_a" MTF="x" GTF="x" ROT="x" UTIL="" />
        <DPOINT NAME="ROLB_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density (LS &amp; SS) - Left" INTERACT="">
        <DPOINT NAME="ROSL_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="ROLL_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density (LS &amp; SS) - Right" INTERACT="">
        <DPOINT NAME="ROSR_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="ROLR_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density (LS &amp; SS) - Up" INTERACT="">
        <DPOINT NAME="ROSU_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="ROLU_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density Caliper - Average" INTERACT="DCAV_RT">
        <DPOINT NAME="DCAV_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density Caliper - Horizontal" INTERACT="DCHO_RT">
        <DPOINT NAME="DCHO_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density Caliper - Vertical" INTERACT="DCVE_RT">
        <DPOINT NAME="DCVE_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Density Image" INTERACT="">
        <DPOINT NAME="A_ROSI_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Image Derived Density (IDD)" INTERACT="IDRO_ADN_RT IDDR_ADN_RT">
        <DPOINT NAME="IDRO_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="IDDR_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Image Derived PEF (ID PEF)" INTERACT="">
        <DPOINT NAME="IDPE_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="PEF - Average" INTERACT="PEF_ADN_RT">
        <DPOINT NAME="PERA_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="PEF - Bottom" INTERACT="PEB_RT PEF_ADN_RT">
        <DPOINT NAME="PERB_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="PEF - Left" INTERACT="PEB_RT PEF_ADN_RT">
        <DPOINT NAME="PERL_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="PEF - Right" INTERACT="PEB_RT PEF_ADN_RT">
        <DPOINT NAME="PERR_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="PEF - Up" INTERACT="">
        <DPOINT NAME="PERU_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Porosity - Average" INTERACT="">
        <DPOINT NAME="TNRA_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="RPM Standard Deviation" INTERACT="">
        <DPOINT NAME="SRPM_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Tool Speed Variation" INTERACT="">
        <DPOINT NAME="DRPM_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Ultrasonic Caliper - Average" INTERACT="ADIA_ADN_RT">
        <DPOINT NAME="ADIA_a" MTF="x" GTF="x" ROT="x" UTIL="" />
      </SERVICE>
      <SERVICE NAME="Ultrasonic Caliper - Axial" INTERACT="CL15_ADN_RT CL37_ADN_RT">
        <DPOINT NAME="CL15_a" MTF="" GTF="" ROT="x" UTIL="" />
        <DPOINT NAME="CL37_a" MTF="" GTF="" ROT="x" UTIL="" />
      </SERVICE>
    </SERVICES>
  </TOOL>
</LIST>
`;
