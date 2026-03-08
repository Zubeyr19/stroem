export const PRIVACY_POLICY = `
PRIVATLIVSPOLITIK / PRIVACY POLICY
Strøm App
Sidst opdateret / Last updated: March 2026

---

DANSK

1. Hvem er dataansvarlig?
Strøm-appen er udviklet og drives af Zubeyr Abdi (i det følgende "vi" eller "os"), med adresse i Danmark.
Kontakt: zuabd22@student.sdu.dk

2. Hvilke data indsamler vi?

Vi indsamler så lidt data som muligt:

a) Data du selv gemmer lokalt på din enhed
- Valg af prisområde (DK1/DK2)
- Valg af netselskab
- Notifikationsindstillinger og tærskler
- Valutaindstilling
Disse data gemmes udelukkende på din enhed via AsyncStorage og sendes aldrig til os.

b) Abonnementsdata (via RevenueCat)
Hvis du opgraderer til Pro, behandles betalingen af Apple App Store eller Google Play. RevenueCat bruges til at verificere dit abonnement. RevenueCat modtager et anonymt bruger-ID og abonnementsstatus — ikke dit navn, din e-mail eller betalingskortoplysninger.
RevenueCat's privatlivspolitik: https://www.revenuecat.com/privacy

c) Pushnotifikationer
Hvis du aktiverer prisalarmer, bruges Expo Notifications til at sende notifikationer til din enhed. Dit push-token gemmes lokalt og deles med Expo's notifikationsinfrastruktur udelukkende for at levere notifikationer.
Expo's privatlivspolitik: https://expo.dev/privacy

d) Prisdataopkald
Appen henter offentlige elspotpriser og nettariffer fra Energi Data Service (api.energidataservice.dk), som er en åben dansk offentlig API. Disse opkald indeholder ikke personoplysninger.

3. Hvad bruger vi data til?
- Lokale indstillinger: Til at huske dine præferencer mellem sessioner.
- Abonnementsstatus: Til at låse op for Pro-funktioner.
- Pushnotifikationer: Til at advisere dig, når elprisen falder under din tærskel.

4. Deler vi data med tredjepart?
Vi sælger eller deler ikke dine personoplysninger. De eneste tredjeparter der er involveret er:
- RevenueCat (abonnementsstyring)
- Expo (pushnotifikationer)
- Energi Data Service (offentlig prisdata — ingen personoplysninger)

5. Dataopbevaring
Lokalt gemte indstillinger opbevares på din enhed, indtil du afinstallerer appen. Du kan nulstille dem i appen til enhver tid.

6. Dine rettigheder (GDPR)
Som EU-borger har du ret til at:
- Få indsigt i dine data
- Få dine data slettet
- Gøre indsigelse mod behandling
Da vi næsten ingen persondata behandler, kan du blot afinstallere appen for at slette alle lokalt gemte data. For spørgsmål om RevenueCat-data, kontakt dem direkte.

7. Kontakt
Spørgsmål? Kontakt os på: zuabd22@student.sdu.dk

---

ENGLISH

1. Who is responsible for your data?
The Strøm app is developed and operated by Zubeyr Abdi ("we" or "us"), based in Denmark.
Contact: zuabd22@student.sdu.dk

2. What data do we collect?

We collect as little data as possible:

a) Data stored locally on your device
- Price area selection (DK1/DK2)
- Grid operator selection
- Notification settings and thresholds
- Currency preference
This data is stored exclusively on your device via AsyncStorage and is never sent to us.

b) Subscription data (via RevenueCat)
If you upgrade to Pro, payment is processed by Apple App Store or Google Play. RevenueCat is used to verify your subscription status. RevenueCat receives an anonymous user ID and subscription status — not your name, email, or payment details.
RevenueCat privacy policy: https://www.revenuecat.com/privacy

c) Push notifications
If you enable price alerts, Expo Notifications is used to deliver notifications to your device. Your push token is stored locally and shared with Expo's notification infrastructure solely to deliver notifications.
Expo privacy policy: https://expo.dev/privacy

d) Price data requests
The app fetches public electricity spot prices and grid tariffs from Energi Data Service (api.energidataservice.dk), a free open Danish government API. These requests contain no personal data.

3. How do we use your data?
- Local settings: To remember your preferences between sessions.
- Subscription status: To unlock Pro features.
- Push notifications: To alert you when the electricity price drops below your threshold.

4. Do we share data with third parties?
We do not sell or share your personal data. The only third parties involved are:
- RevenueCat (subscription management)
- Expo (push notifications)
- Energi Data Service (public price data — no personal data)

5. Data retention
Locally stored settings are kept on your device until you uninstall the app. You can reset them in the app at any time.

6. Your rights (GDPR)
As an EU resident you have the right to:
- Access your data
- Request deletion of your data
- Object to data processing
Since we process almost no personal data, simply uninstalling the app deletes all locally stored data. For questions about RevenueCat data, contact them directly.

7. Contact
Questions? Contact us at: zuabd22@student.sdu.dk
`.trim();
