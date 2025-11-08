from api.schemas.base_schema import Address
from geopy.geocoders import Nominatim
from geopy.distance import geodesic

def verify_address(address: Address) -> bool:

    # First we will need to convert the given address into coordinates

    # Create geolocator instance.
    geolocator = Nominatim(user_agent="my_geocoder_app")

    input_address = f"{address.street}, {address.zip}, {address.state}, USA"

    input_location = geolocator.geocode(input_address, timeout=3, exactly_one=True)

    if not input_location:
        raise Exception("Invalid Input address or request timed out")

    # Now we will encode our address (UMBC)
    umbc_address = "1000 Hilltop Circle, 21250, MD, USA"

    umbc_location  = geolocator.geocode(umbc_address, timeout=3, exactly_one=True)

    if not umbc_location:
        raise Exception("Invalid UMBC address or request timed out")

    # Calculate distance using geodesic (accounts for Earth's curvature)
    distance = geodesic(
        (input_location.latitude, input_location.longitude),
        (umbc_location.latitude, umbc_location.longitude)
    ).kilometers


    # UMBC website says the campus is 500 acres which is around 2 kilometers. https://umbc.edu/about/facts-and-figures/
    # So we will base the valid distances based on that, adding .5 to be safe.

    valid_dist = 2.5

    if distance > valid_dist:
        return False
    
    return True

