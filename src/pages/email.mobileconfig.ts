import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ url }) => {
  const emailAddress = url.searchParams.get('emailaddress');
  
  if (!emailAddress) {
    return new Response('Email address is required', { status: 400 });
  }

  const host = 'mail.onlinekoers.com';
  const organization = 'OnlineKoers';
  
  // UUIDs need to be unique for each profile. We'll generate them based on the email address for consistency.
  const profileUUID = '9B3A7B9B-5A1A-4A96-B361-A5A15A4A9653'; // Example fixed UUID
  const configUUID = '135982C3-C579-4BB3-B361-A5A15A4A9653';

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>EmailAccountDescription</key>
			<string>${organization}</string>
			<key>EmailAccountName</key>
			<string>${organization}</string>
			<key>EmailAccountType</key>
			<string>EmailTypeIMAP</string>
			<key>EmailAddress</key>
			<string>${emailAddress}</string>
			<key>IncomingMailServerAuthentication</key>
			<string>EmailAuthPassword</string>
			<key>IncomingMailServerHostName</key>
			<string>${host}</string>
			<key>IncomingMailServerPortNumber</key>
			<integer>993</integer>
			<key>IncomingMailServerUseSSL</key>
			<true/>
			<key>OutgoingMailServerAuthentication</key>
			<string>EmailAuthPassword</string>
			<key>OutgoingMailServerHostName</key>
			<string>${host}</string>
			<key>OutgoingMailServerPortNumber</key>
			<integer>465</integer>
			<key>OutgoingMailServerUseSSL</key>
			<true/>
			<key>OutgoingPasswordSameAsIncomingPassword</key>
			<true/>
			<key>PayloadDescription</key>
			<string>Configureert e-mailinstellingen voor ${organization}</string>
			<key>PayloadDisplayName</key>
			<string>E-mailinstellingen (${emailAddress})</string>
			<key>PayloadIdentifier</key>
			<string>com.onlinekoers.email.${emailAddress}</string>
			<key>PayloadType</key>
			<string>com.apple.mail.managed</string>
			<key>PayloadUUID</key>
			<string>${configUUID}</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>PreventAppSheet</key>
			<false/>
			<key>PreventMove</key>
			<false/>
			<key>SMIMEEnabled</key>
			<false/>
			<key>Username</key>
			<string>${emailAddress}</string>
		</dict>
	</array>
	<key>PayloadDescription</key>
	<string>OnlineKoers E-mail Configuratie Profiel</string>
	<key>PayloadDisplayName</key>
	<string>OnlineKoers Mail Setup</string>
	<key>PayloadIdentifier</key>
	<string>com.onlinekoers.profile</string>
	<key>PayloadOrganization</key>
	<string>${organization}</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>${profileUUID}</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>`;

  return new Response(xmlContent, {
    headers: {
      'Content-Type': 'application/x-apple-aspen-config',
      'Content-Disposition': `attachment; filename="onlinekoers-${emailAddress.split('@')[0]}.mobileconfig"`,
    },
  });
};
