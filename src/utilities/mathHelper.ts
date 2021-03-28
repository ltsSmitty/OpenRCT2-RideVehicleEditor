/**
 * Helpers that work with math or numbers.
 */
module MathHelper
{
	/**
	 * Wraps the specified value in a range from 'minimum' to 'maximum'.
	 * 
	 * @param value The specified value.
	 * @param minimum The minimum amount of the range (inclusive).
	 * @param maximum The maximum amount of the range (exclusive).
	 */
	export function wrap(value: number, minimum: number, maximum: number): number
	{
		if (value < minimum)
			value = maximum - 1;
		else if (value >= maximum)
			value = minimum;
		
		return value;
	}



	/**
	 * Clamps the specified value in a range from 'minimum' to 'maximum'.
	 * 
	 * @param value The specified value.
	 * @param minimum The minimum amount of the range (inclusive).
	 * @param maximum The maximum amount of the range (exclusive).
	 */
	export function clamp(value: number, minimum: number, maximum: number): number
	{
		if (value < minimum)
			value = minimum;
		else if (value >= maximum)
			value = maximum - 1;

		return value;
	}
}
export default MathHelper;